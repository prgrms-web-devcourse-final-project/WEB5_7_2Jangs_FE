import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import DocumentEditor from "@/components/DocumentEditor"
import { GraphData } from "@/mock/GraphData"
import { useParams } from "react-router"
import { useState } from "react"
import type { OutputData } from "@editorjs/editorjs"

// Sample initial data for the editor
const sampleEditorData: OutputData = {
  time: Date.now(),
  blocks: [
    {
      id: "1",
      type: "paragraph",
      data: {
        text: "이것은 Editor.js를 사용한 문서 편집기입니다. 편집 모드를 활성화하여 내용을 수정하실 수 있습니다.",
      },
    },
    {
      id: "2",
      type: "paragraph",
      data: {
        text: "이 에디터는 다음과 같은 기능을 제공합니다:",
      },
    },
    {
      id: "3",
      type: "paragraph",
      data: {
        text: "• 편집 모드와 보기 모드 전환",
      },
    },
    {
      id: "4",
      type: "paragraph",
      data: {
        text: "• JSON 형식의 데이터 입출력",
      },
    },
    {
      id: "5",
      type: "paragraph",
      data: {
        text: "• 실시간 데이터 변경 감지",
      },
    },
  ],
  version: "2.30.8",
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [isEditable, setIsEditable] = useState(false)
  const [editorData, setEditorData] = useState<OutputData | undefined>(
    sampleEditorData,
  )

  if (!id) {
    throw new Error("Document ID is required")
  }

  const handleDataChange = (data: OutputData) => {
    console.log("Editor data changed:", data)
    setEditorData(data)
  }

  const toggleEditMode = () => {
    setIsEditable(!isEditable)
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
          isEditable={isEditable}
          initialData={editorData}
          onDataChange={handleDataChange}
        />
      </div>
    </ResizableLayout>
  )
}
