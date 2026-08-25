import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type AppUser = {
  id: string;
  name: string;
  user_name: string;
  email: string;
  department: string | null;
  department_id: string | null;
  designation: string | null;
  designation_id: string | null;
  order: number | null;
  profile_picture_url: string | null;
  two_fa_status: "enabled" | "disabled" | "not_allowed";
  last_login: string;
  created_at: string;
  updated_at: string;
};

type GetUsersQuery = {
  search?: string;
};

type CreateUserBody = {
  name: string;
  user_name: string;
  email: string;
  password: string;
  department_id?: string;
  designation_id?: string;
  profile_picture_url?: string | null;
};

type UpdateUserBody = {
  id: string;
  name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  department_id?: string | null;
  designation_id?: string | null;
  profile_picture_url?: string | null;
};

type MutationMessage = {
  message: string;
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getUsers: builder.query<unknown, GetUsersQuery | void>({
      query: (params) => ({
        url: "/users/all-users",
        params: {
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),

    createUser: builder.mutation<MutationMessage, CreateUserBody>({
      query: (body) => ({
        url: "/users/create-user",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "User created successfully." }),
    }),

    updateUser: builder.mutation<MutationMessage, UpdateUserBody>({
      query: ({ id, ...body }) => ({
        url: `/users/update-user/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: () => ({ message: "User updated successfully." }),
    }),

    deleteUser: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/users/delete-user/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ message: "User deleted successfully." }),
    }),

    reorderUsers: builder.mutation<MutationMessage, string[]>({
      query: (user_ids) => ({
        url: "/users/reorder-users",
        method: "PATCH",
        body: { user_ids },
      }),
      transformResponse: () => ({
        message: "Team order updated successfully.",
      }),
    }),

    uploadUserPhoto: builder.mutation<
      { url: string },
      { file: File; name: string }
    >({
      query: ({ file, name }) => {
        const body = new FormData();
        body.append("image", file);
        body.append("name", name);
        return {
          url: "/users/upload-photo",
          method: "POST",
          body,
        };
      },
      transformResponse: (response: { response?: { url?: string } }) => ({
        url: response?.response?.url ?? "",
      }),
    }),

    deleteUserPhoto: builder.mutation<MutationMessage, string>({
      query: (url) => ({
        url: "/users/delete-photo",
        method: "POST",
        body: { url },
      }),
      transformResponse: () => ({ message: "Photo deleted successfully." }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useReorderUsersMutation,
  useUploadUserPhotoMutation,
  useDeleteUserPhotoMutation,
} = userApi;
