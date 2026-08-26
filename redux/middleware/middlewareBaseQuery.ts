import {
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import Cookies from "js-cookie";
import { performLogout } from "@/lib/logout";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get("pghlasdetg");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // 401 = missing/expired/invalid token, 403 = forbidden; both mean the
  // session is no longer valid, so send the user back to login.
  if (result.error?.status === 401 || result.error?.status === 403) {
    performLogout();
  }

  return result;
};

export default baseQueryWithAuth;
