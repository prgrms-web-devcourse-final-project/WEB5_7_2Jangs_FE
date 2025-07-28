import { useState } from "react"
import { FileText, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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

interface DocumentItem {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  recent: {
    recentType: RecentActivityDtoRecentTypeEnum
    recentTypeId: number
  }
}

const pageSize = 10

export default function DocumentListModal({
  open,
  onOpenChange,
  onDocumentSelect,
  currentDocumentId,
}: DocumentListModalProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const {
    documents,
    isLoading,
    error,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
  } = useDocumentsBySidebar({
    page: currentPage,
    size: pageSize,
    sort: "updatedAt",
    order: "desc",
  })

  const handleDocumentClick = (
    documentId: number,
    recent: {
      recentType: RecentActivityDtoRecentTypeEnum
      recentTypeId: number
    },
  ) => {
    onDocumentSelect(documentId, recent)
  }

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  // 페이지 번호 배열 생성 (현재 페이지 기준으로 5개씩 표시)
  const getPageNumbers = () => {
    const pages = []
    const startPage = Math.max(0, currentPage - 2)
    const endPage = Math.min(totalPages - 1, startPage + 4)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[70vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            문서 목록
            {totalElements > 0 && (
              <span className="text-sm text-gray-500 font-normal">
                (총 {totalElements}개)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
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
                documents.map((doc: DocumentItem) => (
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
                        <span>
                          생성: {formatDateForDocuments(doc.createdAt)}
                        </span>
                        <span>
                          수정: {formatDateForDocuments(doc.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 페이지네이션 UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className="min-w-[40px]"
                  >
                    {page + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNext}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
