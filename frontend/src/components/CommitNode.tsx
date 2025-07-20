import React, { useState } from "react"
import { Handle, Position } from "reactflow"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, GitCompare, Play, Trash2, GitMerge } from "lucide-react"
import type { Commit } from "@/types/graph"
import { GRAPH_LAYOUT } from "@/lib/graphUtils"
import CommitTooltip from "@/components/CommitTooltip"

export type CommitNodeMenuType =
  | "commit-view"
  | "commit-compare"
  | "commit-continueEdit"
  | "commit-delete"
  | "commit-merge"

interface CommitNodeProps {
  commit: Commit
  branchName: string
  color: string
  isCurrentCommit: boolean
  isLastCommit: boolean
  showMergeButton: boolean
  onNodeMenuClick: (type: CommitNodeMenuType, commitId: number) => void
  openDropdownId: string | null
  setOpenDropdownId: (id: string | null) => void
}

const CommitNode = React.memo(function CommitNode({
  commit,
  branchName,
  color,
  isCurrentCommit,
  isLastCommit,
  showMergeButton,
  onNodeMenuClick,
  openDropdownId,
  setOpenDropdownId,
}: CommitNodeProps) {
  // 개별 노드의 hover 상태 관리
  const [hoveredCommit, setHoveredCommit] = useState<{
    commit: Commit
    position: { x: number; y: number }
  } | null>(null)

  return (
    <>
      {/* React Flow Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#555" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ background: "#555" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#555" }}
      />

      <DropdownMenu
        open={openDropdownId === commit.id.toString()}
        onOpenChange={(open) => {
          setOpenDropdownId(open ? commit.id.toString() : null)
        }}
      >
        <DropdownMenuTrigger asChild>
          <div
            className={`relative p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
              isCurrentCommit ? "bg-yellow-50 hover:bg-yellow-100" : ""
            }`}
            style={{ width: GRAPH_LAYOUT.NODE_WIDTH }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setHoveredCommit({
                commit,
                position: {
                  x: rect.left,
                  y: rect.bottom + 8,
                },
              })
            }}
            onMouseLeave={() => setHoveredCommit(null)}
          >
            <div className="font-semibold text-sm truncate">{commit.title}</div>
            <div className="text-xs text-gray-600 mt-1 truncate">
              {commit.description}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(commit.createdAt).toLocaleString()}
            </div>
            <div
              className="text-xs mt-2 px-2 py-1 rounded-full inline-block text-white"
              style={{ backgroundColor: color }}
            >
              {branchName}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44" alignOffset={80}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNodeMenuClick("commit-view", commit.id)
              setOpenDropdownId(null)
            }}
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            문서보기
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNodeMenuClick("commit-compare", commit.id)
              setOpenDropdownId(null)
            }}
            className="cursor-pointer"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            비교하기
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNodeMenuClick("commit-continueEdit", commit.id)
              setOpenDropdownId(null)
            }}
            className="cursor-pointer"
          >
            <Play className="h-4 w-4 mr-2" />
            이어서 작업하기
          </DropdownMenuItem>
          {showMergeButton && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onNodeMenuClick("commit-merge", commit.id)
                setOpenDropdownId(null)
              }}
              className="cursor-pointer text-green-600 focus:text-green-600"
            >
              <GitMerge className="h-4 w-4 mr-2" />
              여기로 머지하기
            </DropdownMenuItem>
          )}
          {isLastCommit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onNodeMenuClick("commit-delete", commit.id)
                setOpenDropdownId(null)
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제하기
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 개별 노드의 Tooltip */}
      {!openDropdownId && <CommitTooltip hoveredCommit={hoveredCommit} />}
    </>
  )
})

export default CommitNode
