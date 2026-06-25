import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getPostsList: builder.query({
      query: (post) =>
        `/posts/all-posts-admin?page=${post?.page}&limit=${post?.limit}&sortBy=${post?.sortBy}&sortOrder=${post?.sortOrder}&search=${post?.search}`,
    }),

    getAuthors: builder.query({
      query: () => `/common-rest/authors`,
    }),

    getCategories: builder.query({
      query: () => `/common-rest/categories`,
    }),
    
    getBlogContent: builder.query({
      query: (post) => `/posts/posts-content?id=${post?.id}`,
    }),


    postBlogAdd: builder.mutation({
      query: (body) => ({
        url: "/posts/create-post",
        method: "POST",
        body,
      }),
    }),

    postBlogUpdate: builder.mutation({
      query: (body) => ({
        url: "/posts/update-post",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetPostsListQuery,
  useGetAuthorsQuery,
  useGetCategoriesQuery,
  usePostBlogAddMutation,
  useLazyGetPostsListQuery,
  usePostBlogUpdateMutation,
  useLazyGetBlogContentQuery,
} = postsApi;
