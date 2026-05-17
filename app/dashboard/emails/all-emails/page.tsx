"use client"

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { useEffect, useState } from "react";
import { formSubmissionsListColumns } from "./components/formSubmissionsListColumns";
import { useLazyGetFormSubmissionsListQuery } from "@/redux/api/emailsApi";

export default function Page() {
  const [trigger, { data, isLoading }] = useLazyGetFormSubmissionsListQuery();

  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    sortBy: "",
    sortOrder: "desc",
    search: "",
  });

  const meta = data?.response?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? paginationData.page;

  const handlePageChange = (page: number) => {
    if (isLoading) return;

    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === paginationData.page) return;

    setPaginationData((prevData) => ({
      ...prevData,
      page: nextPage,
    }));
  };

  useEffect(() => {
    trigger(paginationData);
  }, [trigger, paginationData]);

  return (
    <div className="min-h-[90vh] w-full bg-white rounded-xl p-5">
      <ShadcnTable
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
        isLoading={isLoading}
        columns={formSubmissionsListColumns(setPaginationData)}
        data={data?.response?.data || []}
      />
    </div>
  );
}
