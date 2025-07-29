import { useState, useEffect, useMemo } from "react"
import type { OutputData } from "@editorjs/editorjs"
import DocumentEditor from "./DocumentEditor"
import { Button } from "./ui/button"
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  GitMerge,
  X,
  Check,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calculateBlockDiff,
  type BlockDiff,
  type EditorBlock,
  blockToText,
} from "@/lib/diffUtils"

interface DocumentMergeViewProps {
  baseData: OutputData
  targetData: OutputData
  onSave: (mergedData: OutputData) => void
  onCancel: () => void
}

// 블록 미리보기 컴포넌트
function BlockPreview({
  block,
  side,
  isHighlighted,
  onApply,
}: {
  block: EditorBlock
  side: "base" | "target"
  isHighlighted: boolean
  onApply: () => void
}) {
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

  return (
    <div
      className={cn(
        "relative p-3 mb-2 rounded border transition-all",
        isHighlighted ? "border-blue-400 bg-blue-50" : "border-gray-200",
        "group hover:border-gray-300",
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
          {getBlockIcon(block.type)}
        </span>
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">{block.type}</div>
          <div className="whitespace-pre-wrap text-sm">
            {blockToText(block)}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onApply}
        >
          {side === "base" ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default function DocumentMergeView({
  baseData,
  targetData,
  onSave,
  onCancel,
}: DocumentMergeViewProps) {
  // 초기 머지 데이터는 base 데이터로 설정
  const [mergedData, setMergedData] = useState<OutputData>(baseData)
  const [selectedConflictIndex, setSelectedConflictIndex] = useState<number>(-1)
  const [highlightedBlocks, setHighlightedBlocks] = useState<Set<string>>(
    new Set(),
  )
  const [showBlockDetails, setShowBlockDetails] = useState(true)

  // base와 target 간의 차이점 계산
  const conflicts = useMemo(() => {
    const diffs = calculateBlockDiff(baseData, targetData)
    return diffs.filter((diff) => diff.type !== "unchanged")
  }, [baseData, targetData])

  // 현재 선택된 충돌
  const currentConflict = conflicts[selectedConflictIndex] || null

  // 블록을 머지 데이터에 적용하는 개선된 함수
  const applyBlockFromSide = (blockId: string, side: "base" | "target") => {
    console.log("Applying block:", blockId, "from", side)

    const sourceData = side === "base" ? baseData : targetData
    const blockToApply = sourceData.blocks.find((b) => b.id === blockId)

    if (!blockToApply) {
      console.error("Block not found:", blockId)
      return
    }

    // 블록의 인덱스를 찾기
    const sourceIndex = sourceData.blocks.findIndex((b) => b.id === blockId)

    // 새로운 블록 배열 생성
    const newBlocks = [...mergedData.blocks]

    // 같은 ID의 블록이 이미 있는지 확인
    const existingIndex = newBlocks.findIndex((b) => b.id === blockId)

    if (existingIndex !== -1) {
      // 이미 존재하면 교체
      newBlocks[existingIndex] = { ...blockToApply }
    } else {
      // 존재하지 않으면 적절한 위치에 삽입
      // sourceIndex를 기준으로 삽입 위치 결정
      if (sourceIndex >= 0 && sourceIndex <= newBlocks.length) {
        newBlocks.splice(sourceIndex, 0, { ...blockToApply })
      } else {
        newBlocks.push({ ...blockToApply })
      }
    }

    console.log("New blocks:", newBlocks)

    setMergedData({
      ...mergedData,
      blocks: newBlocks,
      time: Date.now(),
    })

    // 하이라이트 효과
    setHighlightedBlocks(new Set([blockId]))
    setTimeout(() => {
      setHighlightedBlocks(new Set())
    }, 1000)
  }

  // 충돌 블록을 머지 데이터에 적용
  const applyConflictBlock = (fromSide: "base" | "target") => {
    if (!currentConflict) return

    const newBlocks = [...mergedData.blocks]
    const conflictIndex = currentConflict.index

    if (currentConflict.type === "added" && fromSide === "target") {
      // target에서 추가된 블록
      const block = currentConflict.block
      if (block) {
        newBlocks.splice(conflictIndex, 0, block)
      }
    } else if (currentConflict.type === "deleted" && fromSide === "base") {
      // base에서 삭제된 블록은 제거
      const blockId = currentConflict.block?.id
      const index = newBlocks.findIndex((b) => b.id === blockId)
      if (index !== -1) {
        newBlocks.splice(index, 1)
      }
    } else if (currentConflict.type === "modified") {
      // 수정된 블록
      const blockToApply =
        fromSide === "base"
          ? currentConflict.oldBlock
          : currentConflict.newBlock
      if (blockToApply) {
        const index = newBlocks.findIndex((b) => b.id === blockToApply.id)
        if (index !== -1) {
          newBlocks[index] = blockToApply
        }
      }
    }

    setMergedData({
      ...mergedData,
      blocks: newBlocks,
      time: Date.now(),
    })
  }

  // 모든 변경사항을 한쪽에서 가져오기
  const applyAllFromSide = (side: "base" | "target") => {
    console.log("Applying all from side:", side)
    const sourceData = side === "base" ? baseData : targetData
    console.log("Source data:", sourceData)

    setMergedData({
      ...sourceData,
      time: Date.now(), // 타임스탬프를 업데이트하여 강제 리렌더링
    })

    // 모든 블록을 하이라이트 효과로 표시
    const allBlockIds = sourceData.blocks
      .map((block) => block.id || "")
      .filter((id) => id)
    setHighlightedBlocks(new Set(allBlockIds))
    setTimeout(() => {
      setHighlightedBlocks(new Set())
    }, 1500)

    console.log("Merged data updated successfully")
  }

  const handleSave = () => {
    onSave(mergedData)
  }

  const navigateConflict = (direction: "prev" | "next") => {
    if (conflicts.length === 0) return

    if (direction === "next") {
      setSelectedConflictIndex((prev) =>
        prev < conflicts.length - 1 ? prev + 1 : 0,
      )
    } else {
      setSelectedConflictIndex((prev) =>
        prev > 0 ? prev - 1 : conflicts.length - 1,
      )
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GitMerge className="h-5 w-5 text-gray-600" />
          <h1 className="text-lg font-semibold">문서 병합</h1>

          {conflicts.length > 0 && (
            <div className="flex items-center gap-2 ml-6">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">
                {conflicts.length}개의 충돌
              </span>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigateConflict("prev")}
                  disabled={conflicts.length === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {selectedConflictIndex + 1} / {conflicts.length}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigateConflict("next")}
                  disabled={conflicts.length === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBlockDetails(!showBlockDetails)}
          >
            {showBlockDetails ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            블록 상세
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => applyAllFromSide("base")}
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            모두 Base 적용
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyAllFromSide("target")}
          >
            모두 Target 적용
            <ChevronsRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            취소
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            병합 완료
          </Button>
        </div>
      </div>

      {/* 3-way merge 뷰 */}
      <div className="flex-1 flex">
        {/* Base 패널 */}
        <div className="flex-1 flex flex-col border-r">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <span className="font-medium text-sm">Base (원본)</span>
            {currentConflict && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => applyConflictBlock("base")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {showBlockDetails ? (
              <div className="p-4">
                {baseData.blocks.map((block) => (
                  <BlockPreview
                    key={block.id}
                    block={block as EditorBlock}
                    side="base"
                    isHighlighted={highlightedBlocks.has(block.id || "")}
                    onApply={() => applyBlockFromSide(block.id || "", "base")}
                  />
                ))}
              </div>
            ) : (
              <DocumentEditor isEditable={false} initialData={baseData} />
            )}
          </div>
        </div>

        {/* Merged 패널 (중앙) */}
        <div className="flex-1 flex flex-col border-r">
          <div className="bg-blue-100 px-4 py-2 border-b">
            <span className="font-medium text-sm">병합 결과</span>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <DocumentEditor
              key={`merged-${mergedData.time}`}
              isEditable={true}
              initialData={mergedData}
              onDataChange={setMergedData}
            />
          </div>
        </div>

        {/* Target 패널 */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            {currentConflict && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => applyConflictBlock("target")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="font-medium text-sm">Target (변경사항)</span>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {showBlockDetails ? (
              <div className="p-4">
                {targetData.blocks.map((block) => (
                  <BlockPreview
                    key={block.id}
                    block={block as EditorBlock}
                    side="target"
                    isHighlighted={highlightedBlocks.has(block.id || "")}
                    onApply={() => applyBlockFromSide(block.id || "", "target")}
                  />
                ))}
              </div>
            ) : (
              <DocumentEditor isEditable={false} initialData={targetData} />
            )}
          </div>
        </div>
      </div>

      {/* 충돌 정보 바 */}
      {currentConflict && (
        <div className="bg-orange-50 border-t px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              충돌 유형:{" "}
              {currentConflict.type === "added"
                ? "추가됨"
                : currentConflict.type === "deleted"
                  ? "삭제됨"
                  : currentConflict.type === "modified"
                    ? "수정됨"
                    : "알 수 없음"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
