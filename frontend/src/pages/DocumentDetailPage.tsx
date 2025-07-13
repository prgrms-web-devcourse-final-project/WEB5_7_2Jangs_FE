import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import DocumentEditor from "@/components/DocumentEditor"
import { GraphData } from "@/mock/GraphData"
import { useParams } from "react-router"
import { useState } from "react"
import type { OutputData } from "@editorjs/editorjs"
import { EditData } from "@/mock/EditData"

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [editorData, setEditorData] = useState<OutputData | undefined>(EditData)

  if (!id) {
    throw new Error("Document ID is required")
  }

  const handleDataChange = (data: OutputData) => {
    console.log("Editor data changed:", data)
    setEditorData(data)
  }

  return (
    <ResizableLayout initialWidth={400} minWidth={250} maxWidth={600}>
      {/* 사이드바 컨텐츠 */}
      <div className="p-4 h-[calc(100%-40px)] box-sizing: border-box;">
        <DocumentGraph data={GraphData} />
      </div>

      {/* 메인 컨텐츠 - 에디터 */}
      <div className="p-4 h-[calc(100%-40px)] box-sizing: border-box;">
        <DocumentEditor
          isEditable={true}
          initialData={editorData}
          onDataChange={handleDataChange}
        />
      </div>
    </ResizableLayout>
  )
}
