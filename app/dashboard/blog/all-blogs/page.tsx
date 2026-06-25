"use client";

import { ShadcnTable } from "@/components/ui/ShadcnTable";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { blogListColumns } from "./components/blogListColumns";
import { EditBlogDialog } from "./components/edit-blog-dialog";
import { useLazyGetPostsListQuery } from "@/redux/api/postsApi";

export default function Page() {
  const [trigger, { data, isLoading }] = useLazyGetPostsListQuery();

  const [searchInput, setSearchInput] = useState("");
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
    const timeoutId = setTimeout(() => {
      setPaginationData((prevData) => {
        if (prevData.search === searchInput && prevData.page === 1) return prevData;

        return {
          ...prevData,
          page: 1,
          search: searchInput,
        };
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    trigger(paginationData);
  }, [trigger, paginationData]);

  return (
    <div className="min-h-[90vh] w-full bg-white rounded-xl p-5">
      <div className="mb-4 max-w-sm">
        <Input
          type="text"
          placeholder="Search blogs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <ShadcnTable
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
        isLoading={isLoading}
        columns={blogListColumns(setPaginationData, (blog: any) => {
          setSelectedBlog(blog);
          setEditOpen(true);
        })}
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
