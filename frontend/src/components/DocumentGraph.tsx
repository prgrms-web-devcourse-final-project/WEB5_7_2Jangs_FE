import ReactFlow, { Controls, Background, BackgroundVariant } from "reactflow"
import "reactflow/dist/style.css"
import { useState, useMemo, useCallback } from "react"
import type { DocumentGraphProps } from "@/types/graph"
import { useGraphData } from "@/hooks/useGraphData"
import CommitNode from "@/components/CommitNode"

export default function DocumentGraph({
  data,
  currentCommitId,
  onNodeMenuClick,
}: DocumentGraphProps) {
  // 현재 열린 드롭다운 ID를 관리
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const mainBranch = data.branches.find((b) => b.name === "main")
  const activeCommitId = currentCommitId ?? mainBranch?.leafCommitId?.toString()
  const isMainBranchLeafCommit =
    mainBranch?.leafCommitId.toString() === activeCommitId

  // 이벤트 핸들러 메모이제이션
  const handleNodeMenuClick = useCallback(onNodeMenuClick, [])
  const handleSetOpenDropdownId = useCallback(setOpenDropdownId, [])

  // 커스텀 훅으로 노드와 엣지 데이터 생성
  const { nodes: rawNodes, edges } = useGraphData({
    data,
    activeCommitId,
    isMainBranchLeafCommit,
  })

  // 노드에 label (CommitNode 컴포넌트) 추가 - 메모이제이션
  const nodes = useMemo(() => {
    return rawNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        label: (
          <CommitNode
            commit={node.data.commit}
            branchName={node.data.branchName}
            color={node.data.color}
            isCurrentCommit={node.data.isCurrentCommit}
            isLastCommit={node.data.isLastCommit}
            showMergeButton={node.data.showMergeButton}
            onNodeMenuClick={handleNodeMenuClick}
            openDropdownId={openDropdownId}
            setOpenDropdownId={handleSetOpenDropdownId}
          />
        ),
      },
    }))
  }, [rawNodes, openDropdownId, handleNodeMenuClick, handleSetOpenDropdownId])

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
    </div>
  )
}
