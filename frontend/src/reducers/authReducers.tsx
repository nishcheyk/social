import { createSlice} from "@reduxjs/toolkit";
import {type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../services/api";

interface AuthState {
  isAuthenticated: boolean;
  accessToken?: string;
}

const tokenKey = "accessToken";
const initialState: AuthState = {
  accessToken: localStorage.getItem(tokenKey) || undefined,
  isAuthenticated: !!localStorage.getItem(tokenKey),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.accessToken = undefined;
        localStorage.removeItem(tokenKey);
      }
    },
    setAccessToken(state, action: PayloadAction<string | undefined>) {
      state.accessToken = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
        localStorage.setItem(tokenKey, action.payload);
      } else {
        state.isAuthenticated = false;
        localStorage.removeItem(tokenKey);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      const accessToken = payload.data?.accessToken;
      if (accessToken) {
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        localStorage.setItem(tokenKey, accessToken);
      }
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.isAuthenticated = false;
      state.accessToken = undefined;
      localStorage.removeItem(tokenKey);
    });
    builder.addMatcher(api.endpoints.refresh.matchFulfilled, (state, { payload }) => {
      const accessToken = payload.data?.accessToken;
      if (accessToken) {
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        localStorage.setItem(tokenKey, accessToken);
      }
    });
  },
});

export const { setAuthenticated, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
