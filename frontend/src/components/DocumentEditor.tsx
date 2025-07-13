import { useEffect, useRef, useState, useCallback } from "react"
import EditorJS, { type OutputData } from "@editorjs/editorjs"

interface DocumentEditorProps {
  isEditable: boolean
  initialData?: OutputData
  onDataChange?: (data: OutputData) => void
}

export default function DocumentEditor({
  isEditable,
  initialData,
  onDataChange,
}: DocumentEditorProps) {
  const editorRef = useRef<EditorJS | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const saveData = useCallback(async (): Promise<OutputData | null> => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save()
        return outputData
      } catch (error) {
        console.error("Error saving data:", error)
        return null
      }
    }
    return null
  }, [])

  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return
    }

    // Initialize Editor.js with default tools
    const editor = new EditorJS({
      holder: containerRef.current,
      readOnly: !isEditable,
      data: initialData,
      placeholder: isEditable ? "내용을 입력하세요..." : "",
      onChange: async () => {
        if (onDataChange && isEditable) {
          try {
            const outputData = await editor.save()
            onDataChange(outputData)
          } catch (error) {
            console.error("Error saving editor data:", error)
          }
        }
      },
    })

    editor.isReady
      .then(() => {
        setIsReady(true)
        editorRef.current = editor
      })
      .catch((error) => {
        console.error("Editor.js initialization failed:", error)
      })

    return () => {
      if (editorRef.current) {
        console.log(editorRef.current)
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [initialData, isEditable, onDataChange])

  // Handle mode changes
  useEffect(() => {
    if (editorRef.current && isReady) {
      editorRef.current.readOnly.toggle(!isEditable)
    }
  }, [isEditable, isReady])

  // Handle data changes
  useEffect(() => {
    if (editorRef.current && isReady && initialData) {
      editorRef.current.render(initialData)
    }
  }, [initialData, isReady])

  // Expose saveData function to parent component
  useEffect(() => {
    if (containerRef.current) {
      ;(
        containerRef.current as HTMLDivElement & {
          saveData: () => Promise<OutputData | null>
        }
      ).saveData = saveData
    }
  }, [saveData])

  return (
    <div className="w-full h-full">
      <div
        ref={containerRef}
        className={`
          h-full
          min-h-[400px] 
          border rounded-lg 
          p-4
        `}
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
        }}
      />
      {!isReady && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">에디터를 로딩 중...</div>
        </div>
      )}
    </div>
  )
}
