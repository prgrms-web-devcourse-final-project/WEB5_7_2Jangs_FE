import DocumentEditor from "./DocumentEditor"
import DocumentCompareView from "./DocumentCompareView"
import type { OutputData } from "@editorjs/editorjs"
import { EditData } from "@/mock/EditData"

export type DocumentContentMode = "edit" | "view" | "compare"

export default function DocumentContent({
  mode,
  editorData,
  originalData,
  onDataChange,
}: {
  mode: DocumentContentMode
  editorData?: OutputData
  originalData?: OutputData
  onDataChange: (data: OutputData) => void
}) {
  switch (mode) {
    case "edit":
    case "view":
      return (
        <DocumentEditor
          isEditable={mode === "edit"}
          initialData={editorData}
          onDataChange={onDataChange}
        />
      )
    case "compare":
      return (
        <DocumentCompareView
          originalData={originalData || EditData}
          modifiedData={editorData || EditData}
        />
      )
    default:
      return <div>Unknown mode: {mode}</div>
  }
}
