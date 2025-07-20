import { useState, type MouseEvent } from "react"
import { X, GitBranch, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Branch, Commit } from "@/types/graph"

interface BranchTabsProps {
  branches: Branch[]
  commits: Commit[]
  currentBranchId?: number
  onBranchSelect?: (branchId: number) => void
  onBranchDelete?: (branchId: number) => void
  onBranchCreate?: () => void
}

interface DeleteConfirmDialog {
  isOpen: boolean
  branch: Branch | null
  commitCount: number
  isMerged: boolean
}

export default function BranchTabs({
  branches,
  commits,
  currentBranchId,
  onBranchDelete,
}: BranchTabsProps) {
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    isOpen: false,
    branch: null,
    commitCount: 0,
    isMerged: false,
  })

  const getBranchCommitCount = (branchId: number) => {
    return commits.filter((commit) => commit.branchId === branchId).length
  }

  const isBranchMerged = (branch: Branch) => {
    // 실제로는 서버에서 머지 상태를 확인해야 하지만,
    // 여기서는 간단히 main 브랜치가 아닌 브랜치의 커밋이 main에 있는지 확인
    if (branch.name === "main") return true

    // 임시로 fromCommitId가 있으면 머지되지 않은 것으로 간주
    return !branch.fromCommitId
  }

  const handleDeleteClick = (
    e: MouseEvent<HTMLButtonElement>,
    branch: Branch,
  ) => {
    e.stopPropagation()

    // 메인 브랜치는 삭제 불가
    if (branch.name === "main") {
      return
    }

    // 현재 활성 브랜치는 삭제 불가
    if (branch.id === currentBranchId) {
      return
    }

    const commitCount = getBranchCommitCount(branch.id)
    const isMerged = isBranchMerged(branch)

    setDeleteDialog({
      isOpen: true,
      branch,
      commitCount,
      isMerged,
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.branch) {
      onBranchDelete?.(deleteDialog.branch.id)
    }
    setDeleteDialog({
      isOpen: false,
      branch: null,
      commitCount: 0,
      isMerged: false,
    })
  }

  const getBranchColor = (branchId: number) => {
    // 간단한 색상 매핑 (실제로는 더 체계적인 색상 시스템 사용)
    const colors = [
      "#3b82f6", // blue
      "#10b981", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#06b6d4", // cyan
    ]
    return colors[branchId % colors.length]
  }

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 overflow-scroll">
        <GitBranch className="h-4 w-4 text-gray-600" />
        <span className="flex-shrink-0 text-sm font-medium text-gray-700">
          브랜치:
        </span>

        <div className="flex items-center gap-1 flex-1">
          {branches.map((branch) => {
            const isActive = branch.id === currentBranchId
            const isMain = branch.name === "main"
            const canDelete = !isMain && branch.id !== currentBranchId
            const commitCount = getBranchCommitCount(branch.id)

            return (
              <div
                key={branch.id}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-pointer
                  transition-colors group
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-white hover:bg-gray-100 border border-gray-200"
                  }
                `}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getBranchColor(branch.id) }}
                />
                <span className="font-medium">{branch.name}</span>
                <span className="text-xs text-gray-500">({commitCount})</span>

                {canDelete && (
                  <button
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-full p-0.5 transition-all"
                    onClick={(e) => handleDeleteClick(e, branch)}
                    title={`${branch.name} 브랜치 삭제`}
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({
              isOpen: false,
              branch: null,
              commitCount: 0,
              isMerged: false,
            })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-red-600" />
              브랜치 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>
                <strong>'{deleteDialog.branch?.name}'</strong> 브랜치를
                삭제하시겠습니까?
              </div>

              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span>커밋 개수:</span>
                  <span className="font-medium">
                    {deleteDialog.commitCount}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>머지 상태:</span>
                  <span
                    className={`font-medium ${deleteDialog.isMerged ? "text-green-600" : "text-orange-600"}`}
                  >
                    {deleteDialog.isMerged ? "머지됨" : "머지되지 않음"}
                  </span>
                </div>
              </div>

              {!deleteDialog.isMerged && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-medium">주의!</div>
                      <div className="text-sm">
                        이 브랜치는 아직 머지되지 않았습니다. 삭제하면 작업
                        내용이 영구적으로 손실될 수 있습니다.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDeleteConfirm}
            >
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
