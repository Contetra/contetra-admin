import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type AuthorRole = "User" | "Author";

export type AuthorEntry = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: AuthorRole;
  created_at: string;
  updated_at: string;
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
      { author_id: string; role: AuthorRole }
    >({
      query: (body) => ({
        url: "/common-rest/create-author",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "Author created successfully." }),
    }),

    updateAuthorEntry: builder.mutation<
      MutationMessage,
      { id: string; role: AuthorRole }
    >({
      query: ({ id, role }) => ({
        url: `/common-rest/update-authors/${id}`,
        method: "PATCH",
        body: { role },
      }),
      transformResponse: () => ({ message: "Author updated successfully." }),
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
  useUpdateAuthorEntryMutation,
  useDeleteAuthorEntryMutation,
} = postsApi;
