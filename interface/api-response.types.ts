// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface APIResponse<T = any> {
    status: boolean;
    statusCode: number;
    message: string;
    isLoading : boolean;
    isSuccess : boolean;
    isError : boolean;
    error : APIError;
    data: T;
  }
  
  // ✅ Type for error response from RTK Query
  export interface APIError {
    status: number; // e.g., 401
    data: {
      status: boolean;
      statusCode: number;
      message: string;
      data: string[];
    };
  }

  // User data state for filtering and pagination
  export interface UserDataState {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    search: string;
    full_name: string;
    mobile_number: string | null;
  }
