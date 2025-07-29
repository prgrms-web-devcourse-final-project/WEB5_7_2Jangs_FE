import type { OutputData } from "@editorjs/editorjs"
import { useMemo, useState } from "react"
import {
  calculateBlockDiff,
  blockToText,
  type BlockDiff,
  type EditorBlock,
  DIFF_DELETE,
  DIFF_INSERT,
  DIFF_EQUAL,
} from "@/lib/diffUtils"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface DocumentCompareViewProps {
  originalData: OutputData
  modifiedData: OutputData
}

// 블록 렌더링 컴포넌트
function BlockRenderer({
  block,
  className = "",
}: {
  block: EditorBlock
  className?: string
}) {
  const baseClasses = "p-3 mb-2 rounded border-l-4"

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "paragraph":
        return "¶"
      case "header":
        return `H${(block.data.level as number) || 1}`
      case "list":
        return block.data.style === "ordered" ? "1." : "•"
      case "quote":
        return "❝"
      case "code":
        return "</>"
      case "delimiter":
        return "---"
      case "image":
        return "🖼️"
      default:
        return "?"
    }
  }

  const getBlockColor = (type: string) => {
    switch (type) {
      case "header":
        return "border-l-blue-500"
      case "list":
        return "border-l-green-500"
      case "quote":
        return "border-l-yellow-500"
      case "code":
        return "border-l-gray-500"
      case "delimiter":
        return "border-l-purple-500"
      case "image":
        return "border-l-pink-500"
      default:
        return "border-l-gray-300"
    }
  }

  return (
    <div className={cn(baseClasses, getBlockColor(block.type), className)}>
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
          {getBlockIcon(block.type)}
        </span>
        <div className="flex-1">
          <div className="whitespace-pre-wrap text-sm">
            {blockToText(block)}
          </div>
        </div>
      </div>
    </div>
  )
}

// 간단한 수정된 블록 렌더링 컴포넌트
function SimpleModifiedBlockRenderer({
  oldBlock,
  newBlock,
  diffs,
}: {
  oldBlock: EditorBlock
  newBlock: EditorBlock
  diffs: [number, string][]
}) {
  return (
    <div className="p-3 mb-2 rounded border-l-4 border-l-orange-500 bg-orange-50">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
          ✎
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {oldBlock.type !== newBlock.type
              ? `${oldBlock.type} → ${newBlock.type}`
              : ""}
          </div>

          {/* 인라인 Diff 시각화 */}
          <div className="bg-white p-2 rounded text-sm border whitespace-pre-wrap">
            {diffs.map((diff, index) => {
              const [operation, text] = diff
              let className = ""

              if (operation === DIFF_DELETE) {
                className = "bg-red-200 line-through text-red-800"
              } else if (operation === DIFF_INSERT) {
                className = "bg-green-200 text-green-800"
              }

              return (
                <span key={index} className={className}>
                  {text}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// 추가된 블록 렌더링 컴포넌트
function AddedBlockRenderer({ block }: { block: EditorBlock }) {
  return (
    <div className="p-3 mb-2 rounded border-l-4 border-l-green-500 bg-green-100">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
          +
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium text-green-700 mb-1">추가됨</div>
          <div className="text-sm text-green-800 whitespace-pre-wrap">
            {blockToText(block)}
          </div>
        </div>
      </div>
    </div>
  )
}

// 삭제된 블록 렌더링 컴포넌트
function DeletedBlockRenderer({ block }: { block: EditorBlock }) {
  return (
    <div className="p-3 mb-2 rounded border-l-4 border-l-red-500 bg-red-100">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
          -
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium text-red-700 mb-1">삭제됨</div>
          <div className="text-sm text-red-600 whitespace-pre-wrap">
            {blockToText(block)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocumentCompareView({
  originalData,
  modifiedData,
}: DocumentCompareViewProps) {
  const [showUnchanged, setShowUnchanged] = useState(false)

  const blockDiffs = useMemo(() => {
    return calculateBlockDiff(modifiedData, originalData)
  }, [originalData, modifiedData])

  const stats = useMemo(() => {
    const added = blockDiffs.filter((d) => d.type === "added").length
    const deleted = blockDiffs.filter((d) => d.type === "deleted").length
    const modified = blockDiffs.filter((d) => d.type === "modified").length
    const unchanged = blockDiffs.filter((d) => d.type === "unchanged").length

    return { added, deleted, modified, unchanged }
  }, [blockDiffs])

  const filteredDiffs = useMemo(() => {
    return showUnchanged
      ? blockDiffs
      : blockDiffs.filter((d) => d.type !== "unchanged")
  }, [blockDiffs, showUnchanged])

  return (
    <div className="h-full flex flex-col">
      {/* 통계 헤더 */}
      <div className="bg-gray-50 p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">변경사항</h2>
            <button
              onClick={() => setShowUnchanged(!showUnchanged)}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50"
            >
              {showUnchanged ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showUnchanged ? "변경없음 숨기기" : "변경없음 보기"}
            </button>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              추가됨: {stats.added}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              삭제됨: {stats.deleted}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              수정됨: {stats.modified}
            </span>
            {showUnchanged && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                변경없음: {stats.unchanged}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 변경사항 내용 */}
      <div className="flex-1 overflow-auto">
        <div className="w-full p-4 bg-white overflow-y-auto">
          <div className="space-y-2">
            {filteredDiffs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>변경사항이 없습니다.</p>
              </div>
            ) : (
              filteredDiffs.map((diff, index) => {
                const key = `diff-${index}`

                switch (diff.type) {
                  case "added":
                    return (
                      <AddedBlockRenderer
                        key={key}
                        block={diff.block as EditorBlock}
                      />
                    )
                  case "deleted":
                    return (
                      <DeletedBlockRenderer
                        key={key}
                        block={diff.block as EditorBlock}
                      />
                    )
                  case "modified":
                    return (
                      <SimpleModifiedBlockRenderer
                        key={key}
                        oldBlock={diff.oldBlock as EditorBlock}
                        newBlock={diff.newBlock as EditorBlock}
                        diffs={diff.diffs || []}
                      />
                    )
                  case "unchanged":
                    return (
                      <BlockRenderer
                        key={key}
                        block={diff.block as EditorBlock}
                        className="bg-gray-50 opacity-75"
                      />
                    )
                  default:
                    return null
                }
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
