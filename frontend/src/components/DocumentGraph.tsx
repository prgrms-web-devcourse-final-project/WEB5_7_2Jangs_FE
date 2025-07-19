import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, GitCompare, Menu, Play, Trash2, GitMerge } from "lucide-react"

// GraphData 타입 정의
interface Commit {
  id: number
  branchId: number
  title: string
  description: string
  createdAt: string
}

interface GraphEdge {
  from: number
  to: number
}

interface Branch {
  id: number
  name: string
  createdAt: string
  fromCommitId: number | null
  rootCommitId: number
  leafCommitId: number
  tempId: number | null
}

interface GraphDataType {
  title: string
  commits: Commit[]
  edges: GraphEdge[]
  branches: Branch[]
}

interface DocumentGraphProps {
  data: GraphDataType
  currentCommitId: string | null
  onNodeMenuClick: (
    type: "view" | "compare" | "continueEdit" | "delete" | "merge",
    commitId: number,
  ) => void
}

// 브랜치 이름을 기반으로 해시 생성
function stringToHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// 브랜치별 색상 생성 함수
function getBranchColor(branchName: string): string {
  // main 브랜치는 indigo 색상 유지
  if (branchName === "main") {
    return "#6366f1"
  }

  // 미리 정의된 색상 팔레트
  const colorPalette = [
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#ec4899", // pink
    "#14b8a6", // teal
    "#a855f7", // purple
    "#22c55e", // green
    "#3b82f6", // blue
    "#f43f5e", // rose
    "#eab308", // yellow
    "#6366f1", // indigo
  ]

  // 브랜치 이름을 기반으로 색상 선택
  const hash = stringToHash(branchName)
  const colorIndex = hash % colorPalette.length
  return colorPalette[colorIndex]
}

export default function DocumentGraph({
  data,
  currentCommitId,
  onNodeMenuClick,
}: DocumentGraphProps) {
  // 현재 열린 드롭다운 ID를 관리
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  // Hover 상태 관리
  const [hoveredCommit, setHoveredCommit] = useState<{
    commit: Commit
    position: { x: number; y: number }
  } | null>(null)

  const mainBranch = data.branches.find((b) => b.name === "main")

  const activeCommitId = currentCommitId ?? mainBranch?.leafCommitId?.toString()
  const isMainBranchLeafCommit =
    mainBranch?.leafCommitId.toString() === activeCommitId

  // 커밋을 React Flow 노드로 변환
  const nodes = useMemo<Node[]>(() => {
    // 브랜치별 커밋 그룹화
    const branchCommits: Record<number, Commit[]> = {}
    for (const commit of data.commits) {
      if (!branchCommits[commit.branchId]) {
        branchCommits[commit.branchId] = []
      }
      branchCommits[commit.branchId].push(commit)
    }

    // 노드 생성
    return data.commits.map((commit, index) => {
      const branch = data.branches.find((b) => b.id === commit.branchId)
      const branchName = branch?.name || "unknown"
      const color = getBranchColor(branchName)

      // 브랜치별로 x 위치 조정
      const branchIndex = data.branches.findIndex(
        (b) => b.id === commit.branchId,
      )
      const xPosition = branchIndex * 250 + 150

      // 시간순으로 y 위치 조정
      const commitTime = new Date(commit.createdAt).getTime()
      const allTimes = data.commits.map((c) => new Date(c.createdAt).getTime())
      const minTime = Math.min(...allTimes)
      const maxTime = Math.max(...allTimes)
      const yPosition =
        ((commitTime - minTime) / (maxTime - minTime || 1)) * 400 + 100

      // 브랜치의 마지막 커밋인지 확인
      const isLastCommit = branch?.leafCommitId === commit.id

      // 현재 커밋인지 확인
      const isCurrentCommit = activeCommitId === commit.id.toString()

      // 머지 버튼을 보여줄지 확인 (현재 커밋이고, 다른 브랜치의 leafNode인 경우)
      const showMergeButton =
        !isCurrentCommit && isLastCommit && !isMainBranchLeafCommit

      return {
        id: commit.id.toString(),
        position: { x: xPosition, y: yPosition },
        data: {
          label: (
            <DropdownMenu
              open={openDropdownId === commit.id.toString()}
              onOpenChange={(open) => {
                setOpenDropdownId(open ? commit.id.toString() : null)
              }}
            >
              <DropdownMenuTrigger asChild>
                <div
                  className={`relative p-3 w-[180px]  cursor-pointer hover:bg-gray-50 rounded-lg transition-colors ${
                    isCurrentCommit ? "bg-yellow-50 hover:bg-yellow-100" : ""
                  }`}
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
                  <div className="font-semibold text-sm truncate">
                    {commit.title}
                  </div>
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
              <DropdownMenuContent
                align="start"
                className="w-44"
                alignOffset={80}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onNodeMenuClick("view", commit.id)
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
                    onNodeMenuClick("compare", commit.id)
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
                    onNodeMenuClick("continueEdit", commit.id)
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
                      onNodeMenuClick("merge", commit.id)
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
                      onNodeMenuClick("delete", commit.id)
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
          ),
        },
        style: {
          backgroundColor: isCurrentCommit ? "#fefce8" : "white",
          border: `2px solid ${isCurrentCommit ? "#eab308" : color}`,
          borderRadius: "8px",
          width: "auto",
          fontSize: "12px",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      }
    })
  }, [
    data,
    openDropdownId,
    onNodeMenuClick,
    activeCommitId,
    isMainBranchLeafCommit,
  ])

  // 엣지를 React Flow 엣지로 변환
  const edges = useMemo<Edge[]>(() => {
    return data.edges.map((edge, index) => {
      const sourceNode = nodes.find((n) => n.id === edge.from.toString())
      const targetNode = nodes.find((n) => n.id === edge.to.toString())

      // 소스와 타겟이 같은 브랜치인지 확인
      const sourceCommit = data.commits.find((c) => c.id === edge.from)
      const targetCommit = data.commits.find((c) => c.id === edge.to)
      const isSameBranch = sourceCommit?.branchId === targetCommit?.branchId

      return {
        id: `edge-${edge.from}-${edge.to}`,
        source: edge.from.toString(),
        target: edge.to.toString(),
        type: isSameBranch ? "smoothstep" : "default",
        animated: !isSameBranch,
        style: {
          stroke: isSameBranch ? "#6b7280" : "#10b981",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSameBranch ? "#6b7280" : "#10b981",
        },
      }
    })
  }, [data, nodes])

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full border border-gray-200 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Portal로 렌더링되는 Hover Popover */}
      {hoveredCommit &&
        createPortal(
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
        )}
    </div>
  )
}
