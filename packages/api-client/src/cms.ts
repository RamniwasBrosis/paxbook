import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@paxbook/auth-client";
import type {
  BannerDto,
  BlogPostDto,
  FaqItemDto,
  HomepageBlockDto,
  PageDto,
  SaveBannerDto,
  SaveBlogPostDto,
  SaveFaqItemDto,
  SaveHomepageBlockDto,
  SavePageDto,
  SaveVisaInfoDto,
  VisaInfoDto,
} from "@paxbook/types";

function makeCrudHooks<TDto, TSaveDto>(resource: string, queryKey: string) {
  function useList() {
    return useQuery({ queryKey: [queryKey], queryFn: () => apiFetch<TDto[]>(`/cms/${resource}`) });
  }

  function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    queryClient.invalidateQueries({ queryKey: ["audit-log"] });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: TSaveDto) => apiFetch<TDto>(`/cms/${resource}`, { method: "POST", body: payload }),
      onSuccess: () => invalidate(queryClient),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TSaveDto }) =>
        apiFetch<TDto>(`/cms/${resource}/${id}`, { method: "PATCH", body: payload }),
      onSuccess: () => invalidate(queryClient),
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => apiFetch<{ id: string }>(`/cms/${resource}/${id}`, { method: "DELETE" }),
      onSuccess: () => invalidate(queryClient),
    });
  }

  return { useList, useCreate, useUpdate, useDelete };
}

const banners = makeCrudHooks<BannerDto, SaveBannerDto>("banners", "cms-banners");
export const useBanners = banners.useList;
export const useCreateBanner = banners.useCreate;
export const useUpdateBanner = banners.useUpdate;
export const useDeleteBanner = banners.useDelete;

const faq = makeCrudHooks<FaqItemDto, SaveFaqItemDto>("faq", "cms-faq");
export const useFaqItems = faq.useList;
export const useCreateFaqItem = faq.useCreate;
export const useUpdateFaqItem = faq.useUpdate;
export const useDeleteFaqItem = faq.useDelete;

const blog = makeCrudHooks<BlogPostDto, SaveBlogPostDto>("blog", "cms-blog");
export const useBlogPosts = blog.useList;
export const useCreateBlogPost = blog.useCreate;
export const useUpdateBlogPost = blog.useUpdate;
export const useDeleteBlogPost = blog.useDelete;

const homepageBlocks = makeCrudHooks<HomepageBlockDto, SaveHomepageBlockDto>("homepage-blocks", "cms-homepage-blocks");
export const useHomepageBlocks = homepageBlocks.useList;
export const useCreateHomepageBlock = homepageBlocks.useCreate;
export const useUpdateHomepageBlock = homepageBlocks.useUpdate;
export const useDeleteHomepageBlock = homepageBlocks.useDelete;

const pages = makeCrudHooks<PageDto, SavePageDto>("pages", "cms-pages");
export const usePages = pages.useList;
export const useCreatePage = pages.useCreate;
export const useUpdatePage = pages.useUpdate;
export const useDeletePage = pages.useDelete;

export function useVisaInfoList() {
  return useQuery({ queryKey: ["cms-visa-info"], queryFn: () => apiFetch<VisaInfoDto[]>("/cms/visa-info") });
}

export function useSaveVisaInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ countryId, payload }: { countryId: string; payload: SaveVisaInfoDto }) =>
      apiFetch<VisaInfoDto>(`/cms/visa-info/${countryId}`, { method: "PUT", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-visa-info"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
  });
}
