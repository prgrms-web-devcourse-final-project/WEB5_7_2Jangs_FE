import React from "react"
import { createPortal } from "react-dom"
import type { HoveredCommit } from "@/types/graph"

interface CommitTooltipProps {
  hoveredCommit: HoveredCommit | null
}

const CommitTooltip = React.memo(function CommitTooltip({
  hoveredCommit,
}: CommitTooltipProps) {
  if (!hoveredCommit) return null

  return createPortal(
    <div
      className="fixed p-3 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px] max-w-[300px] pointer-events-none"
      style={{
        left: hoveredCommit.position.x,
        top: hoveredCommit.position.y,
        zIndex: 9999,
      }}
    >
      <div className="font-semibold text-sm text-gray-900 mb-2">
        {hoveredCommit.commit.title}
      </div>
      <div
        className="text-xs text-gray-600 leading-relaxed"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {hoveredCommit.commit.description}
      </div>
      {/* 화살표 */}
      <div className="absolute bottom-full left-4 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white"></div>
      <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-gray-200 -mb-px"></div>
    </div>,
    document.body,
  )
})

export default CommitTooltip
