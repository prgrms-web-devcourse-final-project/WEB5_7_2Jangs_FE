import { useState, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { useAuth } from "./useAuth"
import type { DocListResponse } from "@/api/__generated__"
import type { PageDocListResponse } from "@/api/__generated__/models/PageDocListResponse"

const PAGE_SIZE = 10

type Sort = "title" | "updatedAt"
type Order = "asc" | "desc"

// API 응답을 프론트엔드 Document 타입으로 변환
function transformDocListResponse(apiDoc: DocListResponse) {
  return {
    id: apiDoc.id || 0,
    title: apiDoc.title || "제목 없음",
    createdAt: apiDoc.createdAt
      ? apiDoc.createdAt.toISOString()
      : new Date().toISOString(),
    updatedAt: apiDoc.updatedAt
      ? apiDoc.updatedAt.toISOString()
      : new Date().toISOString(),
    preview: apiDoc.preview || "미리보기가 없습니다.",
    recent: {
      recentType: apiDoc.recent?.recentType || "SAVE",
      recentTypeId: apiDoc.recent?.recentTypeId || 0,
    },
  }
}

export function useDocuments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [inputValue, setInputValue] = useState("") // input의 내부 값을 관리
  const [sort, setSort] = useState<Sort>("updatedAt")
  const [order, setOrder] = useState<Order>("desc")
  const { isAuthenticated } = useAuth()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // 검색 실행 함수
  const handleSearch = () => {
    setSearchQuery(inputValue.trim())
  }

  // 검색 초기화 함수
  const handleResetSearch = () => {
    setInputValue("")
    setSearchQuery("")
  }

  const { data, isLoading, error, refetch, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["documents", sort, order, searchQuery], // searchQuery를 queryKey에 추가
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        // 검색 쿼리가 있으면 search API 사용, 없으면 readList API 사용
        if (searchQuery.trim()) {
          const response = await apiClient.document.search({
            keyword: searchQuery.trim(),
            page: pageParam,
            sort: sort,
            order: order,
            size: PAGE_SIZE,
          })
          // 실제로는 PageDocListResponse를 반환하므로 타입 단언 사용
          return response as unknown as PageDocListResponse
        } else {
          const response = await apiClient.document.readList({
            page: pageParam,
            sort: sort,
            order: order,
            size: PAGE_SIZE,
          })

          // 실제로는 PageDocListResponse를 반환하므로 타입 단언 사용
          return response as unknown as PageDocListResponse
        }
      },
      getNextPageParam: (lastPage) => {
        // 마지막 페이지가 아니면 다음 페이지 번호 반환
        if (lastPage?.last === false) {
          return lastPage.pageable?.pageNumber ?? 0 + 1
        }
        return 0
      },
      initialPageParam: 0,
      enabled: isAuthenticated,
    })

  // InfiniteData를 평면 배열로 변환
  const documents = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) =>
      (page.content ?? []).map(transformDocListResponse),
    )
  }, [data])

  const totalCount = data?.pages[0]?.totalElements ?? 0

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  return {
    // Raw data
    documents,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    totalCount,
    // Search functionality
    searchQuery,
    inputValue,
    setInputValue,
    handleSearch,
    handleResetSearch,
    viewMode,
    toggleViewMode,
    // Sort functionality
    sort,
    setSort,
    order,
    setOrder,
  }
}
