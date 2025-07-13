import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import DocumentEditor from "@/components/DocumentEditor"
import { GraphData } from "@/mock/GraphData"
import { useParams } from "react-router"
import { useEffect, useState } from "react"
import type { OutputData } from "@editorjs/editorjs"
import { EditData } from "@/mock/EditData"
import { Menu } from "lucide-react"
import Loading from "@/components/Loading"

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [editorData, setEditorData] = useState<OutputData | undefined>(EditData)

  const [isLoading, setIsLoading] = useState(true)

  if (!id) {
    throw new Error("Document ID is required")
  }

  const handleDataChange = (data: OutputData) => {
    console.log("Editor data changed:", data)
    setEditorData(data)
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
    <ResizableLayout initialWidth={450} minWidth={250} maxWidth={800}>
      {/* 사이드바 컨텐츠 */}
      <div className="p-4 h-[calc(100%-48px)] box-sizing: border-box;">
        <div className="flex justify-between items-center z-10 w-full bg-gray-300 rounded-t-md p-2">
          <button className="cursor-pointer">
            <h2 className="text-2xl font-bold">{GraphData.title}</h2>
          </button>
          <button className="cursor-pointer">
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
  )
}
