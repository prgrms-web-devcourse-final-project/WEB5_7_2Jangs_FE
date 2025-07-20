import ResizableLayout from "@/layouts/ResizableLayout"
import DocumentGraph from "@/components/DocumentGraph"
import { GraphData } from "@/mock/GraphData"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import type { OutputData } from "@editorjs/editorjs"
import { EditData } from "@/mock/EditData"
import { Menu, FileText } from "lucide-react"
import Loading from "@/components/Loading"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DocumentList } from "@/mock/DocumentList"
import { formatDateForDocuments } from "@/lib/date"
import DocumentContent from "@/components/DocumentContent"
import type { CommitNodeMenuType } from "@/components/CommitNode"
import type { TempNodeMenuType } from "@/components/TempNode"

export type Mode = "view" | "edit" | "compare" | "delete"

export default function DocumentDetailPage() {
  const { id: documentId } = useParams<{
    id: string
  }>()

  const [searchParams] = useSearchParams()

  // 특정 query parameter 값 가져오기
  const modeParam = searchParams.get("mode")
  const mode = (modeParam as Mode) ?? "view"
  const commitId = searchParams.get("commitId")
  const compareCommitId = searchParams.get("compareCommitId")
  const tempId = searchParams.get("tempId")

  const navigate = useNavigate()
  const [editorData, setEditorData] = useState<OutputData | undefined>(EditData)
  const [originalData, setOriginalData] = useState<OutputData | undefined>(
    EditData,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isDocumentListOpen, setIsDocumentListOpen] = useState(false)

  if (!documentId) {
    throw new Error("Document ID is required")
  }

  const handleDataChange = (data: OutputData) => {
    console.log("Editor data changed:", data)
    setEditorData(data)
  }

  const handleDocumentListModalClick = (documentId: number) => {
    setIsDocumentListOpen(false)
    navigate(`/documents/${documentId}`)
  }

  const handleNodeMenuClick = (
    type: CommitNodeMenuType | TempNodeMenuType,
    idByType: number, // commitId or tempId
  ) => {
    console.log("node click", type, documentId, commitId)
    switch (type) {
      case "commit-view":
        navigate(`/documents/${documentId}?mode=view&commitId=${idByType}`)
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
        navigate(`/documents/${documentId}?mode=edit&commitId=${commitId}`)
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
        navigate(`/documents/${documentId}?mode=edit&tempId=${idByType}`)
        break
    }
  }

  const handleBranchDelete = async (branchId: number) => {
    console.log("Branch delete:", branchId)

    const branch = GraphData.branches.find((b) => b.id === branchId)
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
      const currentCommit = GraphData.commits.find(
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

  // 데이터 로드 시뮬레이션
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // 여기서 실제로는 API를 통해 커밋 데이터를 가져와야 합니다
      if (mode === "compare" && commitId && compareCommitId) {
        // 비교 모드에서는 두 개의 커밋 데이터를 가져옴
        const originalCommitData = await fetchCommitData(commitId)
        const modifiedCommitData = await fetchCommitData(compareCommitId)

        setOriginalData(originalCommitData)
        setEditorData(modifiedCommitData)
      } else if (commitId) {
        // 특정 커밋 데이터 가져오기
        const commitData = await fetchCommitData(commitId)
        setEditorData(commitData)
        setOriginalData(commitData)
      } else {
        // 기본 데이터 (최신 버전)
        setEditorData(EditData)
        setOriginalData(EditData)
      }

      setIsLoading(false)
    }

    loadData()
  }, [mode, commitId, compareCommitId])

  // 임시 데이터 가져오기 함수 (실제로는 API 호출)
  const fetchCommitData = async (commitId: string): Promise<OutputData> => {
    // 시뮬레이션을 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 실제로는 API에서 커밋 데이터를 가져옴
    // 지금은 EditData를 기반으로 약간 수정된 데이터 반환
    if (commitId === "11") {
      return {
        ...EditData,
        blocks: [
          {
            id: "1",
            type: "paragraph",
            data: {
              text: "이것은 첫 번째 버전의 Editor.js 문서입니다.",
            },
          },
          {
            id: "2",
            type: "header",
            data: {
              text: "기본 기능",
              level: 2,
            },
          },
          {
            id: "3",
            type: "list",
            data: {
              style: "unordered",
              items: ["텍스트 편집", "기본 포맷팅"],
            },
          },
        ],
      }
    } else if (commitId === "12") {
      return {
        ...EditData,
        blocks: [
          {
            id: "1",
            type: "paragraph",
            data: {
              text: "이것은 수정된 Editor.js 문서입니다. 더 많은 기능이 추가되었습니다.",
            },
          },
          {
            id: "2",
            type: "header",
            data: {
              text: "향상된 기능",
              level: 2,
            },
          },
          {
            id: "3",
            type: "list",
            data: {
              style: "unordered",
              items: ["텍스트 편집", "기본 포맷팅", "실시간 저장", "버전 관리"],
            },
          },
          {
            id: "4",
            type: "quote",
            data: {
              text: "이것은 새로 추가된 인용문입니다.",
            },
          },
        ],
      }
    }

    return EditData
  }

  if (isLoading) {
    return <Loading text="문서를 불러오는 중..." />
  }

  return (
    <>
      <ResizableLayout initialWidth={450} minWidth={250} maxWidth={800}>
        {/* 사이드바 컨텐츠 */}
        <div className="p-4 h-[calc(100%-48px)] box-sizing: border-box;">
          <div className="flex justify-between items-center z-10 w-full bg-gray-300 rounded-t-md p-2">
            <button className="cursor-pointer">
              <h2 className="text-2xl font-bold">{GraphData.title}</h2>
            </button>
            <button
              className="cursor-pointer hover:bg-gray-400 p-1 rounded"
              onClick={() => setIsDocumentListOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <DocumentGraph
            data={GraphData}
            currentCommitId={commitId}
            currentTempId={tempId}
            onNodeMenuClick={handleNodeMenuClick}
            onBranchDelete={handleBranchDelete}
          />
        </div>

        {/* 메인 컨텐츠 - 에디터 */}
        <div className="p-4 h-[calc(100%)] box-sizing: border-box;">
          <DocumentContent
            mode={mode}
            editorData={editorData}
            originalData={originalData}
            onDataChange={handleDataChange}
          />
        </div>
      </ResizableLayout>

      {/* 문서 리스트 모달 */}
      <Dialog open={isDocumentListOpen} onOpenChange={setIsDocumentListOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              문서 목록
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {DocumentList.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  doc.id === Number.parseInt(documentId)
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
                onClick={() => handleDocumentListModalClick(doc.id)}
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.preview}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                    <span>생성: {formatDateForDocuments(doc.createdAt)}</span>
                    <span>수정: {formatDateForDocuments(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
