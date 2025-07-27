import { FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateForDocuments } from "@/lib/date"
import { useDocumentsBySidebar } from "@/hooks/useDocumentsBySidebar"
import Loading from "@/components/Loading"
import type { RecentActivityDtoRecentTypeEnum } from "@/api/__generated__"

interface DocumentListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentSelect: (
    documentId: number,
    recent: {
      recentType: RecentActivityDtoRecentTypeEnum
      recentTypeId: number
    },
  ) => void
  currentDocumentId?: number
}

export default function DocumentListModal({
  open,
  onOpenChange,
  onDocumentSelect,
  currentDocumentId,
}: DocumentListModalProps) {
  const { documents, isLoading, error } = useDocumentsBySidebar()

  const handleDocumentClick = (
    documentId: number,
    recent: {
      recentType: RecentActivityDtoRecentTypeEnum
      recentTypeId: number
    },
  ) => {
    onDocumentSelect(documentId, recent)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            문서 목록
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[40vh] overflow-y-auto">
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loading text="문서 목록을 불러오는 중..." />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">
                  문서 목록을 불러오는 중 오류가 발생했습니다.
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">문서가 없습니다.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    doc.id === currentDocumentId
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                  onClick={() => handleDocumentClick(doc.id, doc.recent)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>생성: {formatDateForDocuments(doc.createdAt)}</span>
                      <span>수정: {formatDateForDocuments(doc.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
