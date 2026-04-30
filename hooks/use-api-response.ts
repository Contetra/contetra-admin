import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/* ---------------- Backend Error Shape ---------------- */

type BackendErrorResponse = {
  message: string[];
  error: string;
  statusCode: number;
};

/* ---------------- Hook Props ---------------- */

interface UseApiResponseProps {
  dataSuccess?: any;
  dataError?: FetchBaseQueryError | SerializedError;
  successCondition: boolean;
  errorCondition: boolean;
  path?: string;
}

/* ---------------- Hook ---------------- */

const useApiResponse = ({
  dataSuccess,
  dataError,
  successCondition,
  errorCondition,
  path,
}: UseApiResponseProps) => {
  const router = useRouter();

  useEffect(() => {
    /* -------- Success Handling -------- */
    if (successCondition && dataSuccess) {
      
      toast.success(dataSuccess?.response?.message ?? "Success");

      if (path) {
        router.push(path);
      }
    }

    /* -------- Error Handling -------- */
    if (errorCondition && dataError) {
      // Narrow FetchBaseQueryError
      if ("status" in dataError) {
        const errorData = dataError.data as
          | { response?: BackendErrorResponse }
          | undefined;

        const messages = errorData?.response?.message;

        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(messages);
        }
      } else {
        // SerializedError case
        toast.error(dataError.message ?? "Unexpected error occurred");
      }
    }
  }, [dataSuccess, successCondition, dataError, errorCondition, router, path]);
};

export default useApiResponse;
