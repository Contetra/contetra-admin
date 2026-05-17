import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL}),

  endpoints: (builder) => ({
    postAdminLogin: builder.mutation({
      query: ({ body, captchaToken }) => ({
        url: "/auth/login",
        method: "POST",
        body,
        headers: {
          "x-captcha-token": captchaToken,
        },
      }),
    }),
  }),
});

export const { usePostAdminLoginMutation} = authApi;
