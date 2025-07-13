import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import { GraphData } from "@/mock/GraphData"
import { useParams } from "react-router"

export default function DocumentDetailPage() {
  const { id } = useParams()

  if (!id) {
    throw new Error("Document ID is required")
  }

  return (
    <ResizableLayout initialWidth={400} minWidth={250} maxWidth={600}>
      {/* 사이드바 컨텐츠 */}
      <div className="p-4 h-[calc(100%-140px)] box-sizing: border-box;">
        <DocumentGraph data={GraphData} />
      </div>

      {/* 메인 컨텐츠 - 버전 그래프 */}
      <div className="p-6"></div>
    </ResizableLayout>
  )
}
