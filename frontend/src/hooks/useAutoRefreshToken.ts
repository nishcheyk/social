import { useEffect } from "react";
import { useRefreshMutation } from "../services/api";
import { useAppDispatch } from "../store/store";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";

const REFRESH_INTERVAL = 14 * 60 * 1000; 

export function useAutoRefreshToken(isUserActive: boolean) {
  const [refresh] = useRefreshMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isUserActive) {
      // No refresh calls if user is inactive
      return;
    }

    const interval = setInterval(async () => {
      const userId = localStorage.getItem("userId");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!userId || !refreshToken) {
        clearInterval(interval);
        dispatch(setAuthenticated(false));
        dispatch(setAccessToken(undefined));
        localStorage.clear();
        return;
      }

      try {
        const res = await refresh({ userId, refreshToken }).unwrap();

        if (res.success && res.data) {
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
          localStorage.setItem("userId", res.data.userId);

          dispatch(setAccessToken(res.data.accessToken));
          dispatch(setAuthenticated(true));
        } else {
          clearInterval(interval);
          dispatch(setAuthenticated(false));
          dispatch(setAccessToken(undefined));
          localStorage.clear();
        }
      } catch {
        clearInterval(interval);
        dispatch(setAuthenticated(false));
        dispatch(setAccessToken(undefined));
        localStorage.clear();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isUserActive, refresh, dispatch]);
}
