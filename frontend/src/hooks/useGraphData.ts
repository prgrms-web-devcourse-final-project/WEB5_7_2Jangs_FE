import { useMemo } from "react"
import { type Node, type Edge, MarkerType, Position } from "reactflow"
import type { GraphDataType, Commit, GraphNode } from "@/types/graph"
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
  const commitNodes = useMemo<GraphNode[]>(() => {
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
        id: `commit-${commit.id.toString()}`,
        position: { x: xPosition, y: yPosition },
        data: {
          nodeType: "commit",
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
      } as GraphNode
    })
  }, [data, activeCommitId, isMainBranchLeafCommit])

  // 엣지를 React Flow 엣지로 변환
  const commitEdges = useMemo<Edge[]>(() => {
    return data.edges.map((edge) => {
      // 소스와 타겟이 같은 브랜치인지 확인
      const sourceCommit = data.commits.find((c) => c.id === edge.from)
      const targetCommit = data.commits.find((c) => c.id === edge.to)
      const isSameBranch = sourceCommit?.branchId === targetCommit?.branchId

      // 브랜치별 인덱스 계산 (좌우 방향 결정용)
      const sourceBranchIndex = data.branches.findIndex(
        (b) => b.id === sourceCommit?.branchId,
      )
      const targetBranchIndex = data.branches.findIndex(
        (b) => b.id === targetCommit?.branchId,
      )

      // 다른 브랜치로의 연결인 경우 좌우 핸들 사용
      let sourceHandle: string | undefined
      let targetHandle: string | undefined

      if (!isSameBranch) {
        // 타겟이 소스보다 오른쪽에 있으면 소스는 right, 타겟은 left
        if (targetBranchIndex > sourceBranchIndex) {
          sourceHandle = "right"
          targetHandle = "top"
        } else {
          sourceHandle = "left"
          targetHandle = "top"
        }
      }

      return {
        id: `edge-${edge.from}-${edge.to}`,
        source: `commit-${edge.from.toString()}`,
        target: `commit-${edge.to.toString()}`,
        sourceHandle,
        targetHandle,
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

  const tempNodes = useMemo<GraphNode[]>(() => {
    const tempNodesArray: GraphNode[] = []

    // tempId가 있는 브랜치들을 찾아서 tempNode 생성
    for (const branch of data.branches) {
      if (branch.tempId) {
        // 해당 브랜치의 leafCommit 찾기
        const leafCommit = data.commits.find(
          (c) => c.id === branch.leafCommitId,
        )
        if (leafCommit) {
          const branchName = branch.name
          const color = getBranchColor(branchName)

          // 브랜치별로 x 위치 조정 (leafCommit과 같은 위치)
          const branchIndex = data.branches.findIndex((b) => b.id === branch.id)
          const xPosition =
            branchIndex * GRAPH_LAYOUT.BRANCH_SPACING +
            GRAPH_LAYOUT.BASE_X_OFFSET

          // leafCommit의 y 위치에서 아래로 배치
          const leafCommitTime = new Date(leafCommit.createdAt).getTime()
          const allTimes = data.commits.map((c) =>
            new Date(c.createdAt).getTime(),
          )
          const minTime = Math.min(...allTimes)
          const maxTime = Math.max(...allTimes)
          const leafYPosition =
            ((leafCommitTime - minTime) / (maxTime - minTime || 1)) *
              GRAPH_LAYOUT.HEIGHT_RANGE +
            GRAPH_LAYOUT.BASE_Y_OFFSET

          // leafCommit 아래에 위치 (간격 추가)
          const yPosition = leafYPosition + 80

          tempNodesArray.push({
            id: `temp-${branch.tempId}`,
            position: { x: xPosition, y: yPosition },
            data: {
              nodeType: "temp",
              tempId: branch.tempId,
              branchName,
              color,
              isTemp: true,
              title: "임시 저장",
              description: "임시로 저장된 변경사항",
            },
            style: {
              backgroundColor: "#f9fafb",
              border: `2px dashed ${color}`,
              borderRadius: "8px",
              width: "auto",
              fontSize: "12px",
              opacity: 0.8,
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          } as GraphNode)
        }
      }
    }

    return tempNodesArray
  }, [data])

  return { nodes: [...commitNodes, ...tempNodes], edges: [...commitEdges] }
}
