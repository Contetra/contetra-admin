import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export const emailsApi = createApi({
  reducerPath: "emailsApi",
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getFormSubmissionsList: builder.query({
      query: (post) =>
        `/email/form-submissions-list?page=${post?.page}&limit=${post?.limit}&sortBy=${post?.sortBy}&sortOrder=${post?.sortOrder}`,
    }),


  }),
});

export const {
  useLazyGetFormSubmissionsListQuery
} = emailsApi;
