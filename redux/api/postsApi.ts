import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type AuthorEntry = {
  user_id: string;
  name: string;
  email: string;
};

export type CategoryStatus = "Draft" | "Published";

export type CategoryEntry = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
};

type GetAuthorsListQuery = {
  authorid?: string;
  search?: string;
};

type GetCategoriesListQuery = {
  categoryid?: string;
  search?: string;
};

type CreateCategoryBody = {
  name: string;
  slug: string;
  description?: string;
  status?: CategoryStatus;
};

type UpdateCategoryBody = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  status?: CategoryStatus;
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

    getCategoriesAdmin: builder.query<unknown, GetCategoriesListQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-categories",
        params: {
          ...(params?.categoryid ? { categoryid: params.categoryid } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),

    createCategoryEntry: builder.mutation<MutationMessage, CreateCategoryBody>({
      query: (body) => ({
        url: "/common-rest/create-category",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "Category created successfully." }),
    }),

    updateCategoryEntry: builder.mutation<MutationMessage, UpdateCategoryBody>({
      query: ({ id, ...body }) => ({
        url: `/common-rest/update-categories/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: () => ({ message: "Category updated successfully." }),
    }),

    deleteCategoryEntry: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-categories/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ message: "Category deleted successfully." }),
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
  useGetCategoriesAdminQuery,
  useCreateCategoryEntryMutation,
  useUpdateCategoryEntryMutation,
  useDeleteCategoryEntryMutation,
} = postsApi;
