import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import { useGraphData } from "@/hooks/useGraphData"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { useState } from "react"
import { Menu } from "lucide-react"
import Loading from "@/components/Loading"
import DocumentListModal from "@/components/DocumentListModal"
import DocumentContent, {} from "@/components/DocumentContent"
import type { CommitNodeMenuType } from "@/components/CommitNode"
import type { TempNodeMenuType } from "@/components/TempNode"
import type { DocumentMode, DocumentContentMode } from "@/types/document"
import type { RecentActivityDtoRecentTypeEnum } from "@/api/__generated__"

export default function DocumentDetailPage() {
  const { id: documentId } = useParams<{
    id: string
  }>()

  const [searchParams] = useSearchParams()

  // 특정 query parameter 값 가져오기
  const modeParam = searchParams.get("mode")
  const mode = (modeParam as DocumentMode) ?? "save"
  const commitId = searchParams.get("commitId")
  const compareCommitId = searchParams.get("compareCommitId")
  const saveId = searchParams.get("saveId")

  const navigate = useNavigate()
  const [isDocumentListOpen, setIsDocumentListOpen] = useState(false)

  if (!documentId) {
    throw new Error("Document ID is required")
  }

  // API를 통해 그래프 데이터 가져오기
  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
  } = useGraphData({
    documentId: Number.parseInt(documentId),
  })

  const handleDocumentListModalClick = (
    documentId: number,
    recent: {
      recentType: RecentActivityDtoRecentTypeEnum
      recentTypeId: number
    },
  ) => {
    setIsDocumentListOpen(false)

    const documentMode = recent.recentType === "SAVE" ? "save" : "commit"

    navigate(
      `/documents/${documentId}?mode=${documentMode}&${documentMode}Id=${recent.recentTypeId}`,
    )
  }

  const handleNodeMenuClick = (
    type: CommitNodeMenuType | TempNodeMenuType,
    idByType: number, // commitId or saveId
  ) => {
    console.log("node click", type, documentId, commitId)
    switch (type) {
      case "commit-view":
        navigate(`/documents/${documentId}?mode=commit&commitId=${idByType}`)
        break
      case "commit-compare": {
        if (!commitId || !idByType || commitId === idByType.toString()) {
          return
        }
        const comparedCommitId = idByType

        navigate(
          `/documents/${documentId}?mode=compare&commitId=${commitId}&compareCommitId=${comparedCommitId}`,
        )
        break
      }
      case "commit-continueEdit":
        // navigate(`/documents/${documentId}?mode=edit&commitId=${commitId}`)
        break
      case "commit-merge": {
        // 현재 커밋과 선택된 커밋을 병합
        if (!commitId || !idByType || commitId === idByType.toString()) {
          return
        }
        navigate(
          `/merge?documentId=${documentId}&baseCommitId=${commitId}&targetCommitId=${idByType}`,
        )
        break
      }
      case "commit-delete":
        // 삭제처리
        break
      case "temp-edit":
        console.log("temp-edit", idByType)
        navigate(`/documents/${documentId}?mode=save&saveId=${idByType}`)
        break
    }
  }

  const handleBranchDelete = async (branchId: number) => {
    if (!graphData) return

    console.log("Branch delete:", branchId)

    const branch = graphData.branches.find((b) => b.id === branchId)
    if (!branch) return

    // 안전성 검사
    if (branch.name === "main") {
      alert("메인 브랜치는 삭제할 수 없습니다.")
      return
    }

    try {
      // TODO: 실제 API 호출
      // await deleteBranch(branchId)

      // 임시로 콘솔 로그
      console.log(`브랜치 '${branch.name}'이 삭제되었습니다.`)

      // 삭제된 브랜치가 현재 브랜치였다면 메인으로 리다이렉트
      const currentCommit = graphData.commits.find(
        (c) => c.id.toString() === commitId,
      )
      if (currentCommit?.branchId === branchId) {
        navigate(`/documents/${documentId}`)
      }
    } catch (error) {
      console.error("브랜치 삭제 중 오류:", error)
      alert("브랜치 삭제 중 오류가 발생했습니다.")
    }
  }

  // 그래프 데이터 로딩 중이거나 에러가 있으면 로딩/에러 표시
  if (isGraphLoading) {
    return <Loading text="문서를 불러오는 중..." />
  }

  // if (graphError) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold text-red-600 mb-2">
  //           오류가 발생했습니다
  //         </h2>
  //         <p className="text-gray-600">문서를 불러올 수 없습니다.</p>
  //       </div>
  //     </div>
  //   )
  // }

  if (!graphData) {
    return <Loading text="문서를 불러오는 중..." />
  }

  return (
    <>
      <ResizableLayout initialWidth={450} minWidth={250} maxWidth={800}>
        {/* 사이드바 컨텐츠 */}
        <div className="p-4 h-[calc(100%-48px)] box-sizing: border-box;">
          <div className="flex justify-between items-center z-10 w-full bg-gray-300 rounded-t-md p-2">
            <button className="cursor-pointer">
              <h2 className="text-2xl font-bold">{graphData.title}</h2>
            </button>
            <button
              className="cursor-pointer hover:bg-gray-400 p-1 rounded"
              onClick={() => setIsDocumentListOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <DocumentGraph
            data={graphData}
            currentCommitId={commitId}
            currentSaveId={saveId}
            onNodeMenuClick={handleNodeMenuClick}
            onBranchDelete={handleBranchDelete}
          />
        </div>

        {/* 메인 컨텐츠 - 에디터 */}
        <div className="p-4 h-[calc(100%)] box-sizing: border-box;">
          <DocumentContent
            documentId={Number.parseInt(documentId)}
            contentMode={getDocumentContentMode(mode)}
            documentMode={mode}
            commitId={commitId}
            saveId={saveId}
            compareId={compareCommitId}
          />
        </div>
      </ResizableLayout>

      {/* 문서 리스트 모달 */}
      <DocumentListModal
        open={isDocumentListOpen}
        onOpenChange={setIsDocumentListOpen}
        onDocumentSelect={handleDocumentListModalClick}
        currentDocumentId={Number.parseInt(documentId)}
      />
    </>
  )
}

function getDocumentContentMode(mode: DocumentMode): DocumentContentMode {
  switch (mode) {
    case "commit":
      return "view"
    case "save":
      return "edit"
    case "compare":
      return "compare"
  }
}
