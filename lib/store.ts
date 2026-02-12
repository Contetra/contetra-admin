import { authApi } from "@/redux/api/authApi";
import { configureStore } from "@reduxjs/toolkit";


export const store = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      // auth: authReducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        authApi.middleware,
      ]),
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
