import { useState } from "react"
import { useNavigate } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { getCurrentUserId } from "./useAuth"

export function useCreateDocument() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newDocumentTitle, setNewDocumentTitle] = useState("")
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  // React Query Mutation을 사용한 문서 생성
  const createDocumentMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiClient.document.create({
        userId,
        docTitleRequest: { title },
      })
    },
    onSuccess: (response) => {
      // 성공 시 문서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["documents", userId] })

      // 모달 닫기
      closeCreateModal()

      // 새 문서로 이동 (임시 저장 모드로)
      const newDocumentId = response.id || 0
      navigate(`/documents/${newDocumentId}?mode=save&tempId=0`)

      console.log("새 문서 생성됨:", response)
    },
    onError: (error) => {
      console.error("문서 생성 실패:", error)
      // 여기서 토스트 알림이나 에러 처리를 할 수 있습니다
    },
  })

  const openCreateModal = () => {
    setIsCreateModalOpen(true)
    setNewDocumentTitle("")
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setNewDocumentTitle("")
  }

  const createNewDocument = async () => {
    if (!newDocumentTitle.trim()) return
    createDocumentMutation.mutate(newDocumentTitle.trim())
  }

  return {
    isCreateModalOpen,
    setIsCreateModalOpen,
    newDocumentTitle,
    setNewDocumentTitle,
    isCreating: createDocumentMutation.isPending,
    openCreateModal,
    closeCreateModal,
    createNewDocument,
    error: createDocumentMutation.error,
  }
}
