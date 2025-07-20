import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { getCurrentUserId } from "./useAuth"
import type { Document } from "@/mock/DocumentList"

interface UseEditDocumentProps {
  documents: Document[]
}

export function useEditDocument({ documents }: UseEditDocumentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  // React Query Mutation을 사용한 문서 제목 수정
  const editTitleMutation = useMutation({
    mutationFn: async ({ docId, title }: { docId: number; title: string }) => {
      return await apiClient.document.updateDocumentTitle({
        docId,
        userId,
        docTitleRequest: { title },
      })
    },
    onSuccess: (response, variables) => {
      // 성공 시 문서 목록 캐시 업데이트
      queryClient.setQueryData(
        ["documents", userId],
        (oldData: Document[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map((doc) =>
            doc.id === variables.docId
              ? { ...doc, title: variables.title }
              : doc,
          )
        },
      )

      // 대화창 닫기
      setShowEditDialog(false)
      setDocumentToEdit(null)
      setEditTitle("")

      console.log("문서 제목 수정 완료:", response)
    },
    onError: (error) => {
      console.error("제목 수정 실패:", error)
      // 여기서 토스트 알림이나 에러 처리를 할 수 있습니다
    },
  })

  const handleEditTitle = (id: number) => {
    console.log(`문서 ${id} 제목 수정`)
    const docToEdit = documents.find((doc) => doc.id === id)
    if (docToEdit) {
      setDocumentToEdit(docToEdit)
      setEditTitle(docToEdit.title)
      setShowEditDialog(true)
    }
  }

  const confirmEditTitle = async () => {
    if (!documentToEdit || !editTitle.trim()) return

    editTitleMutation.mutate({
      docId: documentToEdit.id,
      title: editTitle.trim(),
    })
  }

  const cancelEditTitle = () => {
    setShowEditDialog(false)
    setDocumentToEdit(null)
    setEditTitle("")
  }

  return {
    showEditDialog,
    setShowEditDialog,
    documentToEdit,
    editTitle,
    setEditTitle,
    isUpdating: editTitleMutation.isPending,
    handleEditTitle,
    confirmEditTitle,
    cancelEditTitle,
    error: editTitleMutation.error,
  }
}
