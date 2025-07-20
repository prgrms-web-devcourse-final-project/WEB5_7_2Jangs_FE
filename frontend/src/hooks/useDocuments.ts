import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { useAuth } from "./useAuth"
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
  const { userId, isAuthenticated } = useAuth()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated")
      }
      const response = await apiClient.document.readList({ userId })
      return response.map(transformDocListResponse)
    },
    enabled: isAuthenticated && !!userId, // 인증된 경우에만 실행
  })

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
