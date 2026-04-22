import { authApi } from "@/redux/api/authApi";
import { postsApi } from "@/redux/api/postsApi";
import { configureStore } from "@reduxjs/toolkit";

export const store = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [postsApi.reducerPath]: postsApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([authApi.middleware, postsApi.middleware]),
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
