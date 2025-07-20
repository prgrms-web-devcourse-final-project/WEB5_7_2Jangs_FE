import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getCurrentUserId } from "./useAuth"
import type { Document } from "@/mock/DocumentList"

interface UseDeleteDocumentProps {
  documents: Document[]
}

export function useDeleteDocument({ documents }: UseDeleteDocumentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null,
  )
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const handleDeleteDocument = (id: number) => {
    console.log(`문서 ${id} 삭제`)
    const docToDelete = documents.find((doc) => doc.id === id)
    if (docToDelete) {
      setDocumentToDelete(docToDelete)
      setShowDeleteDialog(true)
    }
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete !== null) {
      // TODO: 실제 API 삭제 호출이 구현되면 useMutation으로 변경
      // 현재는 클라이언트 사이드에서만 제거
      queryClient.setQueryData(
        ["documents", userId],
        (oldData: Document[] | undefined) => {
          if (!oldData) return oldData
          return oldData.filter((doc) => doc.id !== documentToDelete.id)
        },
      )

      console.log(`문서 ${documentToDelete.id} 삭제됨 (클라이언트 사이드)`)
    }
    setShowDeleteDialog(false)
    setDocumentToDelete(null)
  }

  const cancelDeleteDocument = () => {
    setShowDeleteDialog(false)
    setDocumentToDelete(null)
  }

  return {
    showDeleteDialog,
    setShowDeleteDialog,
    documentToDelete,
    handleDeleteDocument,
    confirmDeleteDocument,
    cancelDeleteDocument,
  }
}
