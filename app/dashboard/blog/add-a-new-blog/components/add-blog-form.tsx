"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn, truncateLabel } from "@/lib/utils";
import { useState } from "react";
import { RxCaretSort } from "react-icons/rx";
import { CheckIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetAuthorsQuery,
  useGetCategoriesQuery,
  usePostBlogAddMutation,
} from "@/redux/api/postsApi";
import useApiResponse from "@/hooks/use-api-response";
import { DatePicker } from "@/components/ui/date-picker";

interface AuthorItem {
  name: string;
  author_id: string;
}

interface CategoryItem {
  name: string;
  category_id: string;
}

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  excerpt: z.string().min(2, {
    message: "Excerpt must be at least 2 characters.",
  }),
  feature_image_url: z
    .string()
    .min(2, {
      message: "Feature Image Url must be at least 2 characters.",
    }),
  author_id: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  author_name: z.string().min(2, {
    message: "Author Name name must be at least 2 characters.",
  }),
  category_id: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  category_name: z.string().min(2, {
    message: "Category Name name must be at least 2 characters.",
  }),
  content: z.string().min(2, {
    message: "content Name name must be at least 2 characters.",
  }),
  created_at: z.date()
});

export const AddBlogForm = () => {
  const { data: authorData } = useGetAuthorsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const [
    addBlogEducation,
    {
      data: postBlogSuccessData,
      error: postBlogErrorData,
      isSuccess: postBlogSuccess,
      isError: postBlogError,
    },
  ] = usePostBlogAddMutation();

  const [authorOpen, setAuthorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      slug: "",
      feature_image_url: "",
      author_name: "",
      excerpt: "",
      author_id: undefined,
      category_name: "",
      category_id: undefined,
      created_at: undefined,
      content: "<p>Write the blog. Test Blog</p>",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {

    addBlogEducation({
      title: data?.title,
      slug: data?.slug,
      author_id: data?.author_id,
      category_id: data?.category_id,
      feature_image_url: data?.feature_image_url,
      excerpt: data?.excerpt,
      content: "<p>Write the blog. Test Blog</p>",
      created_at : data?.created_at.toISOString()
    });
  }

  useApiResponse({
    dataSuccess: postBlogSuccessData,
    dataError: postBlogErrorData,
    successCondition: postBlogSuccess,
    errorCondition: postBlogError,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div className=" gap-4 items-center w-full grid grid-cols-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="bg-white"
                    placeholder="Enter Title of the blog"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feature_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Image Url</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="bg-white"
                    placeholder="Enter Slug of the blog"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="bg-white"
                    placeholder="Enter Slug of the blog"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Input
                    required
                    className="bg-white"
                    placeholder="Enter Excerpt of the blog"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 mt-1.5 col-span-2 md:col-span-2 xl:col-span-2 2xl:col-span-1 ">
                <FormLabel>Select author *</FormLabel>
                <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          " justify-between border-2",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? truncateLabel(
                              authorData?.response?.find(
                                (author: AuthorItem) =>
                                  author.name === field.value,
                              )?.name || "",
                            )
                          : "Select author..."}
                        <RxCaretSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0 border-2 ">
                    <Command className="">
                      <CommandInput
                        placeholder="Search authors..."
                        className="h-9"
                      />
                      <CommandList className=" handleScrollbar">
                        <CommandEmpty>No authors found.</CommandEmpty>
                        <CommandGroup>
                          {authorData?.response?.map((author: AuthorItem) => (
                            <CommandItem
                              className=" cursor-pointer"
                              value={author.name}
                              key={author.name}
                              onSelect={() => {
                                form.setValue("author_name", author.name);
                                form.setValue("author_id", author.author_id);
                                setAuthorOpen(false);
                              }}
                            >
                              {author.name}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  author.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 mt-1.5 col-span-2 md:col-span-2 xl:col-span-2 2xl:col-span-1 ">
                <FormLabel>Select category *</FormLabel>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          " justify-between border-2",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? truncateLabel(
                              categoriesData?.response?.find(
                                (category: CategoryItem) =>
                                  category.name === field.value,
                              )?.name || "",
                            )
                          : "Select category..."}
                        <RxCaretSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className=" p-0 border-2 ">
                    <Command className="">
                      <CommandInput
                        placeholder="Search categories..."
                        className="h-9"
                      />
                      <CommandList className=" handleScrollbar">
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          {categoriesData?.response?.map(
                            (category: CategoryItem) => (
                              <CommandItem
                                className=" cursor-pointer"
                                value={category.name}
                                key={category.name}
                                onSelect={() => {
                                  form.setValue("category_name", category.name);
                                  form.setValue(
                                    "category_id",
                                    category.category_id,
                                  );
                                  setCategoryOpen(false);
                                }}
                              >
                                {category.name}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    category.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="created_at"
            render={({ field }) => (
              <FormItem className=" col-span-2 md:col-span-2 xl:col-span-2 2xl:col-span-1 ">
                <FormLabel>Created At *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={"Enter Start Date..."}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">{"Add Blog"}</Button>
      </form>
    </Form>
  );
};
