import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import DocumentEditor from "@/components/DocumentEditor"
import { GraphData } from "@/mock/GraphData"
import { useParams, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import type { OutputData } from "@editorjs/editorjs"
import { EditData } from "@/mock/EditData"
import { Menu, FileText } from "lucide-react"
import Loading from "@/components/Loading"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Document, DocumentList } from "@/mock/DocumentList"
import { formatDate, formatDateForDocuments } from "@/lib/date"

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editorData, setEditorData] = useState<OutputData | undefined>(EditData)
  const [isLoading, setIsLoading] = useState(true)
  const [isDocumentListOpen, setIsDocumentListOpen] = useState(false)

  if (!id) {
    throw new Error("Document ID is required")
  }

  const handleDataChange = (data: OutputData) => {
    console.log("Editor data changed:", data)
    setEditorData(data)
  }

  const handleDocumentClick = (documentId: number) => {
    setIsDocumentListOpen(false)
    navigate(`/documents/${documentId}`)
  }

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return <Loading text="문서를 불러오는 중..." />
  }

  return (
    <>
      <ResizableLayout initialWidth={450} minWidth={250} maxWidth={800}>
        {/* 사이드바 컨텐츠 */}
        <div className="p-4 h-[calc(100%-48px)] box-sizing: border-box;">
          <div className="flex justify-between items-center z-10 w-full bg-gray-300 rounded-t-md p-2">
            <button className="cursor-pointer">
              <h2 className="text-2xl font-bold">{GraphData.title}</h2>
            </button>
            <button
              className="cursor-pointer hover:bg-gray-400 p-1 rounded"
              onClick={() => setIsDocumentListOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <DocumentGraph data={GraphData} />
        </div>

        {/* 메인 컨텐츠 - 에디터 */}
        <div className="p-4 h-[calc(100%)] box-sizing: border-box;">
          <DocumentEditor
            isEditable={true}
            initialData={editorData}
            onDataChange={handleDataChange}
          />
        </div>
      </ResizableLayout>

      {/* 문서 리스트 모달 */}
      <Dialog open={isDocumentListOpen} onOpenChange={setIsDocumentListOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              문서 목록
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2">
              <div className="space-y-2">
                {DocumentList.map((document) => (
                  <div
                    key={document.id}
                    className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      document.id === Number.parseInt(id)
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => handleDocumentClick(document.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {document.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {document.preview}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span className="text-gray-500">
                            최종편집일:{" "}
                            {formatDateForDocuments(document.updatedAt)}
                          </span>
                          <span>
                            최초생성일: {formatDate(document.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
