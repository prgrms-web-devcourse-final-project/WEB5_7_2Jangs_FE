import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react"
import EditorJS, { type OutputData } from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Quote from "@editorjs/quote"
import Code from "@editorjs/code"
import Delimiter from "@editorjs/delimiter"
import Paragraph from "@editorjs/paragraph"

interface DocumentEditorProps {
  isEditable: boolean
  initialData?: OutputData
  onDataChange?: (data: OutputData) => void
}

export interface DocumentEditorRef {
  saveData: () => Promise<OutputData | null>
}

const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(
  ({ isEditable, initialData, onDataChange }, ref) => {
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

    useImperativeHandle(
      ref,
      () => ({
        saveData,
      }),
      [saveData],
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (!containerRef.current) {
        return
      }

      // 이미 에디터가 있으면 먼저 삭제
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
        setIsReady(false)
      }

      // Initialize Editor.js with default tools
      const editor = new EditorJS({
        holder: containerRef.current,
        readOnly: !isEditable,
        data: initialData,
        placeholder: isEditable ? "내용을 입력하세요..." : "",
        tools: {
          header: {
            class: Header as any,
            config: {
              placeholder: "제목을 입력하세요",
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          list: {
            class: List as any,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
            config: {
              quotePlaceholder: "인용문을 입력하세요",
              captionPlaceholder: "인용문의 출처",
            },
          },
          code: {
            class: Code as any,
            config: {
              placeholder: "코드를 입력하세요",
            },
          },
          delimiter: Delimiter as any,
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
          },
        },
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
    }, [initialData?.time]) // initialData의 time이 변경될 때마다 재생성

    // Handle mode changes
    useEffect(() => {
      if (editorRef.current && isReady) {
        editorRef.current.readOnly.toggle(!isEditable)
      }
    }, [isEditable, isReady])

    // Handle data changes - 이제 에디터 재생성으로 처리됨
    // useEffect(() => {
    //   console.log("DocumentEditor: initialData changed", initialData)
    //   if (editorRef.current && isReady && initialData) {
    //     // Editor를 완전히 재생성하는 대신 render 메서드 사용
    //     editorRef.current.render(initialData).catch((error) => {
    //       console.error("Error rendering new data:", error)
    //     })
    //   }
    // }, [initialData, isReady])

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
  },
)

DocumentEditor.displayName = "DocumentEditor"

export default DocumentEditor
