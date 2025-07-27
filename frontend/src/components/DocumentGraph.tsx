import ReactFlow, { Controls, Background, BackgroundVariant } from "reactflow"
import "reactflow/dist/style.css"
import { useState, useMemo, useCallback } from "react"
import { useGraphRender } from "@/hooks/useGraphData"
import CommitNode, { type CommitNodeMenuType } from "@/components/CommitNode"
import TempNode, { type TempNodeMenuType } from "@/components/TempNode"
import BranchTabs from "@/components/BranchTabs"
import type { Branch, GraphDataType } from "@/types/graph"

export interface DocumentGraphProps {
  data: GraphDataType
  currentCommitId: string | null
  currentSaveId: string | null
  currentBranchId: number
  mainBranch: Branch
  onNodeMenuClick: (
    type: CommitNodeMenuType | TempNodeMenuType,
    commitId: number,
    isLastCommit?: boolean,
  ) => void
  onBranchDelete?: (branchId: number) => void
}

export default function DocumentGraph({
  data,
  currentCommitId,
  currentSaveId,
  currentBranchId,
  mainBranch,
  onNodeMenuClick,
  onBranchDelete,
}: DocumentGraphProps) {
  // 현재 열린 드롭다운 ID를 관리
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const activeCommitId =
    currentCommitId ??
    (currentSaveId ? null : mainBranch?.leafCommitId?.toString())
  const activeSaveId = currentSaveId

  const isMainBranchLeafCommit =
    mainBranch?.leafCommitId.toString() === activeCommitId

  // 이벤트 핸들러 메모이제이션
  const handleNodeMenuClick = useCallback(onNodeMenuClick, [])
  const handleSetOpenDropdownId = useCallback(setOpenDropdownId, [])

  // 커스텀 훅으로 노드와 엣지 데이터 생성
  const { nodes: rawNodes, edges } = useGraphRender({
    data,
    activeCommitId,
    activeSaveId,
    isMainBranchLeafCommit,
  })

  // 노드에 label (CommitNode 컴포넌트) 추가 - 메모이제이션
  const nodes = useMemo(() => {
    return rawNodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        label:
          node.data.nodeType === "commit" ? (
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
          ) : (
            <TempNode
              tempId={node.data.saveId}
              branchName={node.data.branchName}
              color={node.data.color}
              isCurrentTemp={node.data.isCurrentTemp}
              title={node.data.title}
              description={node.data.description}
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
      <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden">
        {/* 브랜치 탭 */}
        <BranchTabs
          branches={data.branches}
          commits={data.commits}
          currentBranchId={currentBranchId}
          onBranchDelete={onBranchDelete}
        />

        {/* 그래프 */}
        <div className="w-full h-[calc(100%-60px)]">
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
    </div>
  )
}
