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
import { useMemo } from "react"

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

export default function DocumentGraph({ data }: DocumentGraphProps) {
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

      return {
        id: commit.id.toString(),
        position: { x: xPosition, y: yPosition },
        data: {
          label: (
            <div
              className="p-3 min-w-[180px]"
              onClick={() => {
                console.log(commit)
              }}
            >
              <div className="font-semibold text-sm">{commit.title}</div>
              <div className="text-xs text-gray-600 mt-1">
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
          ),
        },
        style: {
          backgroundColor: "white",
          border: `2px solid ${color}`,
          borderRadius: "8px",
          width: "auto",
          fontSize: "12px",
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      }
    })
  }, [data])

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
    <div className="w-full h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{data.title}</h2>
      </div>
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
    </div>
  )
}
