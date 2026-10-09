import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type Role = {
  id: string;
  name: string;
  description: string;
};

export type UserRole = {
  user_id: string;
  role_id: string;
  user_name: string;
  user_email: string;
  role_name: string;
  role_description: string;
};

type GetRolesQuery = {
  roleid?: string;
  search?: string;
};

type GetUserRolesQuery = {
  user_id?: string;
  role_id?: string;
};

type CreateRoleBody = {
  name: string;
  description: string;
};

type UpdateRoleBody = {
  id: string;
  name?: string;
  description?: string;
};

type CreateUserRoleBody = {
  user_id: string;
  role_id: string;
};

type DeleteUserRoleBody = {
  userId: string;
  roleId: string;
};

type MutationMessage = {
  message: string;
};

export type MyPermissions = Record<string, boolean>;

export type Policy = {
  id: string;
  name: string;
  description: string | null;
  effect: "allow" | "deny";
  action: string;
  resource_type: string;
  condition: string;
};

export type PolicyBinding = {
  id: string;
  policy_id: string;
  policy_name: string;
  action: string;
  resource_type: string;
  effect: "allow" | "deny";
  user_id: string | null;
  user_email: string | null;
  role_id: string | null;
  role_name: string | null;
};

type CreatePolicyBindingBody = {
  policy_id: string;
  user_id?: string;
  role_id?: string;
};

export const rbacApi = createApi({
  reducerPath: "rbacApi",
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getMyPermissions: builder.query<MyPermissions, void>({
      query: () => ({
        url: "/rbac/my-permissions",
      }),
      // Backend wraps every response as { statusCode, response: <payload> }.
      transformResponse: (raw: { response: MyPermissions }) => raw.response,
    }),
    getRoles: builder.query<unknown, GetRolesQuery | void>({
      query: (params) => ({
        url: "/rbac/get-roles",
        params: {
          ...(params?.roleid ? { roleid: params.roleid } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),
    createRole: builder.mutation<MutationMessage, CreateRoleBody>({
      query: (body) => ({
        url: "/rbac/post-roles",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "Role created successfully." }),
    }),
    updateRole: builder.mutation<MutationMessage, UpdateRoleBody>({
      query: ({ id, ...body }) => ({
        url: `/rbac/update-roles/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: () => ({ message: "Role updated successfully." }),
    }),
    deleteRole: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/rbac/delete-roles/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ message: "Role deleted successfully." }),
    }),
    getUserRoles: builder.query<unknown, GetUserRolesQuery | void>({
      query: (params) => ({
        url: "/rbac/get-user-roles",
        params: {
          ...(params?.user_id ? { user_id: params.user_id } : {}),
          ...(params?.role_id ? { role_id: params.role_id } : {}),
        },
      }),
    }),
    createUserRole: builder.mutation<MutationMessage, CreateUserRoleBody>({
      query: (body) => ({
        url: "/rbac/post-user-roles",
        method: "POST",
        body,
      }),
      transformResponse: () => ({
        message: "Role assigned to user successfully.",
      }),
    }),
    deleteUserRole: builder.mutation<MutationMessage, DeleteUserRoleBody>({
      query: ({ userId, roleId }) => ({
        url: `/rbac/delete-user-roles/${userId}/${roleId}`,
        method: "DELETE",
      }),
      transformResponse: () => ({
        message: "Role removed from user successfully.",
      }),
    }),
    getPolicies: builder.query<unknown, void>({
      query: () => ({
        url: "/rbac/get-policies",
      }),
    }),
    getPolicyBindings: builder.query<unknown, void>({
      query: () => ({
        url: "/rbac/get-policy-bindings",
      }),
    }),
    createPolicyBinding: builder.mutation<
      MutationMessage,
      CreatePolicyBindingBody
    >({
      query: (body) => ({
        url: "/rbac/post-policy-bindings",
        method: "POST",
        body,
      }),
      transformResponse: () => ({
        message: "Permission granted successfully.",
      }),
    }),
    deletePolicyBinding: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/rbac/delete-policy-bindings/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({
        message: "Permission revoked successfully.",
      }),
    }),
  }),
});

export const {
  useGetMyPermissionsQuery,
  useGetRolesQuery,
  useLazyGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetUserRolesQuery,
  useLazyGetUserRolesQuery,
  useCreateUserRoleMutation,
  useDeleteUserRoleMutation,
  useGetPoliciesQuery,
  useGetPolicyBindingsQuery,
  useCreatePolicyBindingMutation,
  useDeletePolicyBindingMutation,
} = rbacApi;
