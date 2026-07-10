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

type GetFormsQuery = {
  formid?: string;
  search?: string;
};

type GetFormTypesQuery = {
  formtypeid?: string;
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
} = settingsApi;
