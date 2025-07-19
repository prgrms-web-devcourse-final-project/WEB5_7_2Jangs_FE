import { useMemo } from "react"
import { type Node, type Edge, MarkerType, Position } from "reactflow"
import type { GraphDataType, Commit } from "@/types/graph"
import { getBranchColor, GRAPH_LAYOUT } from "@/lib/graphUtils"

interface UseGraphDataProps {
  data: GraphDataType
  activeCommitId: string | undefined
  isMainBranchLeafCommit: boolean
}

export function useGraphData({
  data,
  activeCommitId,
  isMainBranchLeafCommit,
}: UseGraphDataProps) {
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
    return data.commits.map((commit) => {
      const branch = data.branches.find((b) => b.id === commit.branchId)
      const branchName = branch?.name || "unknown"
      const color = getBranchColor(branchName)

      // 브랜치별로 x 위치 조정
      const branchIndex = data.branches.findIndex(
        (b) => b.id === commit.branchId,
      )
      const xPosition =
        branchIndex * GRAPH_LAYOUT.BRANCH_SPACING + GRAPH_LAYOUT.BASE_X_OFFSET

      // 시간순으로 y 위치 조정
      const commitTime = new Date(commit.createdAt).getTime()
      const allTimes = data.commits.map((c) => new Date(c.createdAt).getTime())
      const minTime = Math.min(...allTimes)
      const maxTime = Math.max(...allTimes)
      const yPosition =
        ((commitTime - minTime) / (maxTime - minTime || 1)) *
          GRAPH_LAYOUT.HEIGHT_RANGE +
        GRAPH_LAYOUT.BASE_Y_OFFSET

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
          commit,
          branchName,
          color,
          isCurrentCommit,
          isLastCommit,
          showMergeButton,
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
  }, [data, activeCommitId, isMainBranchLeafCommit])

  // 엣지를 React Flow 엣지로 변환
  const edges = useMemo<Edge[]>(() => {
    return data.edges.map((edge) => {
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
  }, [data])

  return { nodes, edges }
}
