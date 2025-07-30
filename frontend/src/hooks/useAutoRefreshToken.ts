import { useEffect } from "react";
import { useRefreshMutation } from "../services/api";
import { useAppDispatch } from "../store/store";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

/**
 * React hook to automatically refresh authentication tokens at regular intervals
 * while the user is active.
 *
 * @param {boolean} isUserActive - Whether the user is currently active.
 */
export function useAutoRefreshToken(isUserActive: boolean) {
  const [refresh] = useRefreshMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isUserActive) return;

    // Start token refresh interval
    const interval = setInterval(async () => {
      const userId = localStorage.getItem("userId");
      const refreshToken = localStorage.getItem("refreshToken");

      // If tokens missing, clear auth state and stop refreshing
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
          // Update tokens and auth state
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
          localStorage.setItem("userId", res.data.userId);

          dispatch(setAccessToken(res.data.accessToken));
          dispatch(setAuthenticated(true));
        } else {
          // Refresh failed: clear and stop
          clearInterval(interval);
          dispatch(setAuthenticated(false));
          dispatch(setAccessToken(undefined));
          localStorage.clear();
        }
      } catch {
        // Error during refresh: clear and stop
        clearInterval(interval);
        dispatch(setAuthenticated(false));
        dispatch(setAccessToken(undefined));
        localStorage.clear();
      }
    }, REFRESH_INTERVAL);

    // Clear interval on unmount or deps change
    return () => clearInterval(interval);
  }, [isUserActive, refresh, dispatch]);
}
