import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../middleware/middlewareBaseQuery";

export type Form = {
  id: string;
  form_name: string;
  form_type_id: string;
  created_at: string;
  updated_at: string;
};

export type FormType = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Designation = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type GetFormsQuery = {
  formid?: string;
  search?: string;
};

type GetFormTypesQuery = {
  formtypeid?: string;
  search?: string;
};

type GetDepartmentsQuery = {
  departmentid?: string;
  search?: string;
};

type GetDesignationsQuery = {
  designationid?: string;
  search?: string;
};

type MutationMessage = {
  message: string;
};

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQueryWithAuth,

  endpoints: (builder) => ({
    getForms: builder.query<unknown, GetFormsQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-forms",
        params: {
          ...(params?.formid ? { formid: params.formid } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),
    getFormTypes: builder.query<unknown, GetFormTypesQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-form-types",
        params: {
          ...(params?.formtypeid ? { formtypeid: params.formtypeid } : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),
    createForm: builder.mutation<
      MutationMessage,
      { form_name: string; form_type_id: string }
    >({
      query: (body) => ({
        url: "/common-rest/post-forms",
        method: "POST",
        body,
      }),
      transformResponse: () => ({ message: "Form created successfully." }),
    }),
    updateForm: builder.mutation<
      MutationMessage,
      { id: string; form_name: string; form_type_id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/common-rest/update-forms/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: () => ({ message: "Form updated successfully." }),
    }),
    deleteForm: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-forms/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({ message: "Form deleted successfully." }),
    }),
    createFormType: builder.mutation<MutationMessage, { name: string }>({
      query: (body) => ({
        url: "/common-rest/post-form-types",
        method: "POST",
        body,
      }),
      transformResponse: () => ({
        message: "Form type created successfully.",
      }),
    }),
    updateFormType: builder.mutation<
      MutationMessage,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/common-rest/update-form-types/${id}`,
        method: "PATCH",
        body: { name },
      }),
      transformResponse: () => ({
        message: "Form type updated successfully.",
      }),
    }),
    deleteFormType: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-form-types/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({
        message: "Form type deleted successfully.",
      }),
    }),
    getDepartments: builder.query<unknown, GetDepartmentsQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-departments",
        params: {
          ...(params?.departmentid
            ? { departmentid: params.departmentid }
            : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),
    createDepartment: builder.mutation<MutationMessage, { name: string }>({
      query: (body) => ({
        url: "/common-rest/post-departments",
        method: "POST",
        body,
      }),
      transformResponse: () => ({
        message: "Department created successfully.",
      }),
    }),
    updateDepartment: builder.mutation<
      MutationMessage,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/common-rest/update-departments/${id}`,
        method: "PATCH",
        body: { name },
      }),
      transformResponse: () => ({
        message: "Department updated successfully.",
      }),
    }),
    deleteDepartment: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-departments/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({
        message: "Department deleted successfully.",
      }),
    }),
    getDesignations: builder.query<unknown, GetDesignationsQuery | void>({
      query: (params) => ({
        url: "/common-rest/get-designations",
        params: {
          ...(params?.designationid
            ? { designationid: params.designationid }
            : {}),
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
    }),
    createDesignation: builder.mutation<MutationMessage, { name: string }>({
      query: (body) => ({
        url: "/common-rest/post-designations",
        method: "POST",
        body,
      }),
      transformResponse: () => ({
        message: "Designation created successfully.",
      }),
    }),
    updateDesignation: builder.mutation<
      MutationMessage,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/common-rest/update-designations/${id}`,
        method: "PATCH",
        body: { name },
      }),
      transformResponse: () => ({
        message: "Designation updated successfully.",
      }),
    }),
    deleteDesignation: builder.mutation<MutationMessage, string>({
      query: (id) => ({
        url: `/common-rest/delete-designations/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => ({
        message: "Designation deleted successfully.",
      }),
    }),
  }),
});

export const {
  useGetFormsQuery,
  useLazyGetFormsQuery,
  useGetFormTypesQuery,
  useLazyGetFormTypesQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useCreateFormTypeMutation,
  useUpdateFormTypeMutation,
  useDeleteFormTypeMutation,
  useGetDepartmentsQuery,
  useLazyGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDesignationsQuery,
  useLazyGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = settingsApi;
