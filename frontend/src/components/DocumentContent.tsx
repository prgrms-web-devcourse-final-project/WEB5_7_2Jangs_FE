import DocumentEditor from "./DocumentEditor"
import DocumentCompareView from "./DocumentCompareView"
import { EditData } from "@/mock/EditData"
import type { DocumentContentMode, DocumentMode } from "@/types/document"
import { useDocumentContent } from "@/hooks/useDocumentContent"
import type { OutputData } from "@editorjs/editorjs"

export default function DocumentContent({
  documentMode,
  contentMode,
  documentId,
  commitId,
  saveId,
  compareId,
}: {
  documentMode: DocumentMode
  contentMode: DocumentContentMode
  documentId: number
  commitId: string | null
  saveId: string | null
  compareId: string | null
}) {
  const { originalData, modifiedData, isLoading, error } = useDocumentContent({
    documentMode,
    commitId,
    saveId,
    compareId,
    documentId,
  })

  // API 데이터를 OutputData로 변환하는 함수
  const convertToEditorData = (data: any): OutputData => {
    if (!data) return EditData

    // 이미 OutputData 형태라면 그대로 반환
    if (data.blocks && data.time && data.version) {
      return data as OutputData
    }

    // API 데이터 배열을 OutputData로 변환
    if (Array.isArray(data)) {
      return {
        time: Date.now(),
        blocks: data,
        version: "2.30.8",
      } as OutputData
    }

    return EditData
  }

  // 데이터 변경 핸들러 (편집 모드에서 사용)
  const onDataChange = (newData: OutputData) => {
    // TODO: 데이터 변경 로직 구현
    console.log("데이터 변경:", newData)
  }

  // 로딩 상태
  if (isLoading) {
    return <div>데이터를 로딩 중입니다...</div>
  }

  // 에러 상태
  if (error) {
    return <div>오류: {error}</div>
  }

  switch (contentMode) {
    case "edit":
    case "view":
      return (
        <DocumentEditor
          isEditable={contentMode === "edit"}
          initialData={convertToEditorData(originalData)}
          onDataChange={onDataChange}
        />
      )
    case "compare":
      return (
        <DocumentCompareView
          originalData={convertToEditorData(originalData) || EditData}
          modifiedData={convertToEditorData(modifiedData) || EditData}
        />
      )
    default:
      return <div>Unknown mode: {contentMode}</div>
  }
}
