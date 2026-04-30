"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "@/components/ui/button";
import useApiResponse from "@/hooks/use-api-response";
import {
  useLazyGetBlogContentQuery,
  usePostBlogUpdateMutation,
} from "@/redux/api/postsApi";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const [
    updateBlogEducation,
    {
      data: updateBlogSuccessData,
      error: updateBlogErrorData,
      isSuccess: updateBlogSuccess,
      isError: updateBlogError,
    },
  ] = usePostBlogUpdateMutation();

  const [
    trigger,
    {
      data: blogContent,
      isSuccess: blogContentSuccess,
      isError: blogContentError,
      error: blogError,
    },
  ] = useLazyGetBlogContentQuery();

  const paramArray = Array.isArray(params.params) ? params.params : [];
  const [blog_id] = paramArray;

  useEffect(() => {
    if (blog_id) {
      console.log("blog_id", blog_id);
      trigger({ id: blog_id });
    } else {
      router.push("/dashbaord");
    }
  }, [trigger, blog_id, router]);

  const [content, setContent] = useState("");

  const updateProfile = useEffectEvent((con: string) => {
    setContent(con);
  });

  useEffect(() => {
    if (blogContentSuccess) {
      const contentFromApi = blogContent?.response[0]?.content;
      
      updateProfile(contentFromApi);
    }
  }, [blogContentSuccess, blogContent]);

  useEffect(() => {
    if (blogContentError && blogError) {
      router.push("/dashboard");
    }
  }, [blogContentError, blogError, router]);

  const updateBLog = () => {
    updateBlogEducation({
      id: blog_id,
      content,
    });
  };

  useApiResponse({
    dataSuccess: updateBlogSuccessData,
    dataError: updateBlogErrorData,
    successCondition: updateBlogSuccess,
    errorCondition: updateBlogError,
  });

  return (
    <div className="h-[90vh] w-full bg-white rounded-xl p-5 flex flex-col ">
      <div>
        <Button onClick={() => updateBLog()}>Save Blog</Button>
      </div>

      <SimpleEditor content={content} onChange={(value) => setContent(value)} />
    </div>
  );
}
