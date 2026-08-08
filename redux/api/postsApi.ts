import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type AuthorEntry = {
  user_id: string;
  name: string;
  email: string;
};

type GetAuthorsListQuery = {
  authorid?: string;
  search?: string;
};

type MutationMessage = {
  message: string;
};

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

    getAuthorsAdmin: builder.query<unknown, GetAuthorsListQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-authors",
        params: {
          ...(params?.authorid ? { authorid: params.authorid } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),

    createAuthorEntry: builder.mutation<
      MutationMessage,
      { author_id: string }
    >({
      query: (body) => ({
        url: "/common-rest/create-author",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "Author created successfully." }),
    }),

    deleteAuthorEntry: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-authors/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ message: "Author deleted successfully." }),
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
  useGetAuthorsAdminQuery,
  useCreateAuthorEntryMutation,
  useDeleteAuthorEntryMutation,
} = postsApi;
