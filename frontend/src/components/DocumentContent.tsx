import DocumentEditor, { type DocumentEditorRef } from "./DocumentEditor"
import DocumentCompareView from "./DocumentCompareView"
import SaveCommitModal from "./SaveCommitModal"
import { EditData } from "@/mock/EditData"
import type { DocumentContentMode, DocumentMode } from "@/types/document"
import { useDocumentContent } from "@/hooks/useDocumentContent"
import type { OutputData } from "@editorjs/editorjs"
import { Button } from "./ui/button"
import { apiClient } from "@/api/apiClient"
import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { calculateBlockDiff } from "@/lib/diffUtils"

import { useDialog, alertDialog } from "./ui/alert-dialog"
import { useNavigate } from "react-router"

export default function DocumentContent({
  documentMode,
  contentMode,
  documentId,
  branchId,
  commitId,
  saveId,
  compareId,
  currentBranchLastCommitId,
}: {
  documentMode: DocumentMode
  contentMode: DocumentContentMode
  documentId: number
  branchId: number
  commitId: string | null
  saveId: string | null
  compareId: string | null
  currentBranchLastCommitId: number | null
}) {
  const { originalData, modifiedData, commitDiffData, isLoading, error } =
    useDocumentContent({
      documentMode,
      commitId,
      saveId,
      compareId,
      documentId,
      currentBranchLastCommitId,
    })

  const editorRef = useRef<DocumentEditorRef>(null)
  const queryClient = useQueryClient()
  const { showDialog } = useDialog()
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    mode: "save" | "commit"
  }>({ isOpen: false, mode: "save" })

  const navigate = useNavigate()

  // API 데이터를 OutputData로 변환하는 함수
  const convertToEditorData = (data: any): OutputData => {
    if (!data) return EditData

    // 이미 OutputData 형태라면 그대로 반환
    if (data.blocks && data.time && data.version) {
      return data as OutputData
    }

    // API 데이터 배열을 OutputData로 변환
    if (Array.isArray(data)) {
      return {
        time: EditData.time, // 고정된 time을 사용하여 불필요한 재생성 방지
        blocks: data,
        version: "2.30.8",
      } as OutputData
    }

    return EditData
  }

  // 데이터 변경 핸들러 (편집 모드에서 사용)
  const onDataChange = (newData: OutputData) => {
    // TODO: 데이터 변경 로직 구현
    console.log("데이터 변경:", newData)
  }

  // 저장 API 호출
  const saveMutation = useMutation({
    mutationFn: async ({
      content,
    }: {
      content: any[]
    }) => {
      if (!saveId) throw new Error("저장 ID가 없습니다")

      return await apiClient.save.updateSave({
        docId: documentId,
        saveId: Number(saveId),
        saveUpdateRequest: {
          content,
        },
      })
    },
    onSuccess: async () => {
      // 그래프 데이터만 refetch (문서 내용은 현재 편집 중인 상태 유지)
      queryClient.invalidateQueries({ queryKey: ["graphData", documentId] })
      setModalState({ isOpen: false, mode: "save" })

      // 저장 완료 메시지 표시
      await alertDialog("저장이 완료되었습니다.", "완료", "default")
    },
    onError: async (error: any) => {
      console.error("저장 실패:", error)

      // 서버에서 내려온 에러 메시지 추출
      let errorMessage = "저장에 실패했습니다."

      try {
        // OpenAPI Generator의 ResponseError 구조에 맞게 파싱
        if (error?.response && error.response.status === 400) {
          const errorData = await error.response.json()
          console.log("errorData", errorData)
          if (errorData?.message) {
            errorMessage = errorData.message
          }
        }
      } catch (parseError) {
        console.error("에러 메시지 파싱 실패:", parseError)
      }

      console.log("errorMessage", errorMessage)

      await alertDialog(errorMessage, "오류", "destructive")
    },
  })

  // 기록 API 호출
  const commitMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      blocks,
      blockOrders,
    }: {
      title: string
      description?: string
      blocks: any[]
      blockOrders: string[]
    }) => {
      return await apiClient.commit.createCommit({
        docId: documentId,
        createCommitRequest: {
          title,
          description,
          blocks: blocks.map((block) => ({ data: block })),
          blockOrders: blockOrders,
          branchId,
        },
      })
    },
    onSuccess: () => {
      // 그래프 데이터만 refetch (문서 내용은 현재 편집 중인 상태 유지)
      queryClient.invalidateQueries({ queryKey: ["graphData", documentId] })
      setModalState({ isOpen: false, mode: "commit" })
    },
    onError: async (error: any) => {
      console.error("기록 실패:", error)

      // 서버에서 내려온 에러 메시지 추출
      let errorMessage = "기록에 실패했습니다."

      try {
        // OpenAPI Generator의 ResponseError 구조에 맞게 파싱
        if (error?.response && error.response.status === 400) {
          const errorData = await error.response.json()
          console.log("errorData", errorData)
          if (errorData?.message) {
            errorMessage = errorData.message
          }
        }
      } catch (parseError) {
        console.error("에러 메시지 파싱 실패:", parseError)
      }

      console.log("errorMessage", errorMessage)

      await alertDialog(errorMessage, "오류", "destructive")
    },
  })

  // 저장하기 버튼 클릭 핸들러
  const handleSave = async () => {
    if (!editorRef.current) {
      await alertDialog("에디터가 준비되지 않았습니다.", "오류", "destructive")
      return
    }

    const currentData = await editorRef.current.saveData()
    if (!currentData) {
      await alertDialog(
        "현재 문서 데이터를 가져올 수 없습니다.",
        "오류",
        "destructive",
      )
      return
    }

    const content = currentData.blocks || []
    saveMutation.mutate({ content })
  }

  // 기록하기 버튼 클릭 핸들러
  const handleCommit = () => {
    setModalState({ isOpen: true, mode: "commit" })
  }

  // Modal 확인 핸들러
  const handleModalConfirm = async ({
    title,
    description,
  }: {
    title: string
    description?: string
  }) => {
    if (!editorRef.current) {
      await alertDialog("에디터가 준비되지 않았습니다.", "오류", "destructive")
      return
    }

    const currentData = await editorRef.current.saveData()
    if (!currentData) {
      await alertDialog(
        "현재 문서 데이터를 가져올 수 없습니다.",
        "오류",
        "destructive",
      )
      return
    }

    const content = currentData.blocks || []

    if (modalState.mode === "save") {
      saveMutation.mutate({ content })
    } else {
      // 원본 데이터와 현재 데이터를 비교하여 변경된 블록만 추출
      const prevCommitDiffEditorData = convertToEditorData(commitDiffData)
      const blockDiffs = calculateBlockDiff(
        prevCommitDiffEditorData,
        currentData,
      )

      // 추가되거나 수정된 블록만 필터링
      const changedBlocks: any[] = []
      for (const diff of blockDiffs) {
        if (diff.type === "added" || diff.type === "modified") {
          const block = diff.newBlock || diff.block
          if (block) {
            changedBlocks.push(block)
          }
        }
      }

      const res = await commitMutation.mutateAsync({
        title,
        description,
        blocks: changedBlocks,
        blockOrders: content.map(
          (block, index) => block.id ?? index.toString(),
        ),
      })

      navigate(`/documents/${documentId}?mode=commit&commitId=${res.id}`)
    }
  }

  // 로딩 상태
  if (isLoading) {
    return <div>데이터를 로딩 중입니다...</div>
  }

  // 에러 상태
  if (error) {
    return <div>오류: {error}</div>
  }

  return (
    <>
      {renderContent()}
      <SaveCommitModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        onClose={() => setModalState({ isOpen: false, mode: "save" })}
        onConfirm={handleModalConfirm}
        isLoading={saveMutation.isPending || commitMutation.isPending}
      />
    </>
  )

  function renderContent() {
    switch (contentMode) {
      case "edit":
        return (
          <div className="h-full flex flex-col">
            <DocumentEditor
              ref={editorRef}
              isEditable={true}
              initialData={convertToEditorData(originalData)}
              onDataChange={onDataChange}
            />
            <div className="flex justify-end gap-10 mt-4 p-4 border-t">
              <Button
                onClick={handleSave}
                variant="outline"
                size="2xl"
                disabled={saveMutation.isPending}
              >
                저장하기
              </Button>
              <Button
                onClick={handleCommit}
                variant="default"
                size="2xl"
                disabled={commitMutation.isPending}
              >
                기록하기
              </Button>
            </div>
          </div>
        )
      case "view":
        return (
          <DocumentEditor
            isEditable={false}
            initialData={convertToEditorData(originalData)}
            onDataChange={onDataChange}
          />
        )
      case "compare":
        return (
          <DocumentCompareView
            originalData={convertToEditorData(originalData) || EditData}
            modifiedData={convertToEditorData(modifiedData) || EditData}
          />
        )
      default:
        return <div>Unknown mode: {contentMode}</div>
    }
  }
}
