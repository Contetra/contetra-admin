"use client"

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { useEffect, useState } from "react";
import { blogListColumns } from "./components/blogListColumns";
import { EditBlogDialog } from "./components/edit-blog-dialog";
import { useLazyGetPostsListQuery } from "@/redux/api/postsApi";

export default function Page() {
  const [trigger, { data, isLoading }] = useLazyGetPostsListQuery();

  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 10,
    sortBy: "",
    sortOrder: "desc",
    search: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

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
        columns={
          blogListColumns(setPaginationData, (blog: any) => {
            setSelectedBlog(blog);
            setEditOpen(true);
          })
        }
        data={data?.response?.data || []}
      />

      <EditBlogDialog
        open={editOpen}
        onOpenChange={(open: boolean) => {
          setEditOpen(open);
          if (!open) setSelectedBlog(null);
        }}
        blogData={selectedBlog}
        onSuccessUpdate={() => trigger(paginationData)}
      />
    </div>
  );
}
