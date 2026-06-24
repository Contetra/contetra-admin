"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, truncateLabel } from "@/lib/utils";
import { RxCaretSort } from "react-icons/rx";
import { CheckIcon } from "lucide-react";
import {
  useGetAuthorsQuery,
  useGetCategoriesQuery,
  usePostBlogUpdateMutation,
  useLazyGetBlogContentQuery,
} from "@/redux/api/postsApi";
import useApiResponse from "@/hooks/use-api-response";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuthorItem {
  name: string;
  author_id: string;
}

interface CategoryItem {
  name: string;
  category_id: string;
}

interface BlogData {
  id: string;
  title: string;
  slug: string;
  feature_image_url: string;
  excerpt: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_og_title?: string;
  meta_og_description?: string;
  created_at: string;
  status: string;
  authors: string[];
  categories: string[];
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
  feature_image_url: z.string().min(2, {
    message: "Feature Image Url must be at least 2 characters.",
  }),
  status: z.enum(["Draft", "Published"]),
  author_id: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  author_name: z.string().min(2, {
    message: "Author Name must be at least 2 characters.",
  }),
  category_id: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  category_name: z.string().min(2, {
    message: "Category Name must be at least 2 characters.",
  }),
  created_at: z.date(),
  meta_title: z.string().max(255, {
    message: "Meta title must be at most 255 characters.",
  }),
  meta_description: z.string().max(1000, {
    message: "Meta description must be at most 1000 characters.",
  }),
  meta_keywords: z.string().max(500, {
    message: "Meta keywords must be at most 500 characters.",
  }),
  meta_og_title: z.string().max(255, {
    message: "Meta OG title must be at most 255 characters.",
  }),
  meta_og_description: z.string().max(1000, {
    message: "Meta OG description must be at most 1000 characters.",
  }),
});

interface EditBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogData: BlogData | null;
  onSuccessUpdate?: () => void;
}

export const EditBlogDialog = ({
  open,
  onOpenChange,
  blogData,
  onSuccessUpdate,
}: EditBlogDialogProps) => {
  const { data: authorData } = useGetAuthorsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});
  const [
    updateBlog,
    {
      data: updateBlogSuccessData,
      error: updateBlogErrorData,
      isSuccess: updateBlogSuccess,
      isError: updateBlogError,
      isLoading: updateBlogLoading,
    },
  ] = usePostBlogUpdateMutation();

  const [authorOpen, setAuthorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [
    triggerBlogContent,
    { data: blogContent, isSuccess: blogContentSuccess },
  ] = useLazyGetBlogContentQuery();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      slug: "",
      feature_image_url: "",
      excerpt: "",
      status: "Draft",
      author_name: "",
      author_id: "",
      category_name: "",
      category_id: "",
      created_at: new Date(),
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      meta_og_title: "",
      meta_og_description: "",
    },
  });

  useEffect(() => {
    const contentSource = blogContent?.response?.[0] ?? {};
    const source = {
      ...blogData,
      ...contentSource,
    };

    const author = source?.authors?.[0];
    const category = source?.categories?.[0];

    form.setValue("title", source?.title || "");
    form.setValue("slug", source?.slug || "");
    form.setValue("feature_image_url", source?.feature_image_url || "");
    form.setValue(
      "author_name",
      author?.name ?? (typeof author === "string" ? author : ""),
    );
    // Resolve author_id: if author is an object use its id, otherwise try to find id by name
    const resolvedAuthorId =
      typeof author === "string"
        ? authorData?.response?.find((a: AuthorItem) => a.name === author)
            ?.author_id ?? ""
        : author?.author_id ?? "";
    form.setValue("author_id", resolvedAuthorId);
    form.setValue("excerpt", source?.excerpt || "");
    form.setValue("status", source?.status || "Draft");
    form.setValue(
      "category_name",
      category?.name ?? (typeof category === "string" ? category : ""),
    );
    // Resolve category_id similarly
    const resolvedCategoryId =
      typeof category === "string"
        ? categoriesData?.response?.find(
            (c: CategoryItem) => c.name === category,
          )?.category_id ?? ""
        : category?.category_id ?? "";
    form.setValue("category_id", resolvedCategoryId);
    if (source?.created_at) {
      form.setValue("created_at", new Date(source.created_at));
    }
    form.setValue("meta_title", source?.meta_title || "");
    form.setValue("meta_description", source?.meta_description || "");
    form.setValue("meta_keywords", source?.meta_keywords || "");
    form.setValue("meta_og_title", source?.meta_og_title || "");
    form.setValue("meta_og_description", source?.meta_og_description || "");
  }, [blogContent, blogContentSuccess, blogData, form, authorData, categoriesData]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Submitting form data:", data);
    if (!blogData?.id) {
      console.error("No blog ID available");
      return;
    }

    updateBlog({
      id: blogData.id,
      title: data?.title,
      slug: data?.slug,
      author_id: data?.author_id,
      category_id: data?.category_id,
      status: data?.status,
      feature_image_url: data?.feature_image_url,
      excerpt: data?.excerpt,
      created_at: data?.created_at.toISOString(),
      meta_title: data?.meta_title,
      meta_description: data?.meta_description,
      meta_keywords: data?.meta_keywords,
      meta_og_title: data?.meta_og_title,
      meta_og_description: data?.meta_og_description,
    })
      .unwrap()
      .then(() => {
        console.log("Blog updated successfully");
        onSuccessUpdate?.();
        onOpenChange(false);
      })
      .catch((err) => {
        console.error("Blog update failed:", err);
      });
  }

  useApiResponse({
    dataSuccess: updateBlogSuccessData,
    dataError: updateBlogErrorData,
    successCondition: updateBlogSuccess,
    errorCondition: updateBlogError,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Details</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Validation errors:", errors);
            })}
            className="space-y-4"
          >
            <div className="grid gap-4 grid-cols-2">
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
                name="feature_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Image Url</FormLabel>
                    <FormControl>
                      <Input
                        required
                        className="bg-white"
                        placeholder="Enter Feature Image Url"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Select author *</FormLabel>
                    <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between border-2",
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
                      <PopoverContent className="p-0 border-2">
                        <Command>
                          <CommandInput
                            placeholder="Search authors..."
                            className="h-9"
                          />
                          <CommandList className="handleScrollbar">
                            <CommandEmpty>No authors found.</CommandEmpty>
                            <CommandGroup>
                              {authorData?.response?.map(
                                (author: AuthorItem) => (
                                  <CommandItem
                                    className="cursor-pointer"
                                    value={author.name}
                                    key={author.name}
                                    onSelect={() => {
                                      form.setValue("author_name", author.name);
                                      form.setValue(
                                        "author_id",
                                        author.author_id,
                                      );
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
                name="category_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Select category *</FormLabel>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between border-2",
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
                      <PopoverContent className="p-0 border-2">
                        <Command>
                          <CommandInput
                            placeholder="Search categories..."
                            className="h-9"
                          />
                          <CommandList className="handleScrollbar">
                            <CommandEmpty>No categories found.</CommandEmpty>
                            <CommandGroup>
                              {categoriesData?.response?.map(
                                (category: CategoryItem) => (
                                  <CommandItem
                                    className="cursor-pointer"
                                    value={category.name}
                                    key={category.name}
                                    onSelect={() => {
                                      form.setValue(
                                        "category_name",
                                        category.name,
                                      );
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
                  <FormItem>
                    <FormLabel>Created At *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter Created Date..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Enter meta title"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Enter meta description"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_keywords"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Meta Keywords</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Enter meta keywords (comma-separated)"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_og_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta OG Title</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Enter meta Open Graph title"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta_og_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta OG Description</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white"
                        placeholder="Enter meta Open Graph description"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateBlogLoading}
              >
                Cancel
              </Button>
              <Button type="submit">
                {updateBlogLoading ? "Updating..." : "Update Blog"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
