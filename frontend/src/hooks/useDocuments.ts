import { useState, useMemo } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { useAuth } from "./useAuth"
import type { DocListResponse, PageDocListResponse } from "@/api/__generated__"

const PAGE_SIZE = 10

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
  const { isAuthenticated } = useAuth()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { data, isLoading, error, refetch } = useInfiniteQuery({
    queryKey: ["documents"],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await apiClient.document.readList({
        page: pageParam,
        size: PAGE_SIZE,
      })
      return response
    },
    getNextPageParam: (lastPage: PageDocListResponse) => {
      // 마지막 페이지가 아니면 다음 페이지 번호 반환
      if (!lastPage.last) {
        return (lastPage.number ?? 1) + 1
      }

      return undefined
    },
    initialPageParam: 1,
    enabled: isAuthenticated,
  })

  // InfiniteData를 평면 배열로 변환
  const documents = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) =>
      (page.content ?? []).map(transformDocListResponse),
    )
  }, [data])

  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.preview.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [documents, searchQuery])

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  return {
    // Raw data
    documents,
    isLoading,
    error,
    refetch,
    // Search functionality
    searchQuery,
    setSearchQuery,
    viewMode,
    toggleViewMode,
    filteredDocuments,
  }
}
