import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { getCurrentUserId } from "./useAuth"
import type { DocListResponse } from "@/api/__generated__"

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const userId = getCurrentUserId()

  // React Query를 사용한 문서 목록 조회
  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const response = await apiClient.document.readList({ userId })
      return response.map(transformDocListResponse)
    },
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  })

  // 검색 필터링 (메모화로 성능 최적화)
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
    documents,
    searchQuery,
    setSearchQuery,
    viewMode,
    toggleViewMode,
    isLoading,
    error,
    filteredDocuments,
    refetch, // 데이터 새로고침을 위한 함수
  }
}
