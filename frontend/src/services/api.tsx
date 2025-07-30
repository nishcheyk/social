import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";

interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
}

interface User {
  _id: string;
  email: string;
  username?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  sessionId?: string;
}

// Basic baseQuery with token from Redux state
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Access token expired, try to refresh

    const refreshToken = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem("userId");

    if (!refreshToken || !userId) {
      api.dispatch(setAccessToken(undefined));
      api.dispatch(setAuthenticated(false));
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "users/refresh",
        method: "POST",
        body: { userId, refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as any;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data.userId);

      api.dispatch(setAccessToken(data.accessToken));
      api.dispatch(setAuthenticated(true));

      // Retry original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(setAccessToken(undefined));
      api.dispatch(setAuthenticated(false));
      localStorage.clear();
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<User>, { email: string; username: string; password: string }>({
      query: (credentials) => ({
        url: "users/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<ApiResponse<LoginResponse>, { username: string; password: string }>({
      query: (credentials) => ({
        url: "users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: "users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    logout: builder.mutation<ApiResponse<void>, { userId: string; accessToken: string }>({
      query: (body) => ({
        url: "users/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    refresh: builder.mutation<ApiResponse<LoginResponse>, { userId: string; refreshToken: string }>({
      query: (body) => ({
        url: "users/refresh",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {̦
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useRefreshMutation,
} = api;
