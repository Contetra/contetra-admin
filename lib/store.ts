import { authApi } from "@/redux/api/authApi";
import { emailsApi } from "@/redux/api/emailsApi";
import { postsApi } from "@/redux/api/postsApi";
import { settingsApi } from "@/redux/api/settingsApi";
import { configureStore } from "@reduxjs/toolkit";

export const store = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [postsApi.reducerPath]: postsApi.reducer,
      [emailsApi.reducerPath]: emailsApi.reducer,
      [settingsApi.reducerPath]: settingsApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        authApi.middleware,
        postsApi.middleware,
        emailsApi.middleware,
        settingsApi.middleware,
      ]),
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
