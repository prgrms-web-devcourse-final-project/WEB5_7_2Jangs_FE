import type { OutputData } from "@editorjs/editorjs"
import { useNavigate, useSearchParams } from "react-router"
import { useState, useEffect } from "react"
import DocumentMergeView from "@/components/DocumentMergeView"
import Loading from "@/components/Loading"
import { EditData } from "@/mock/EditData"

export default function MergePage() {
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get("documentId")
  const baseCommitId = searchParams.get("baseCommitId")
  const targetCommitId = searchParams.get("targetCommitId")

  const navigate = useNavigate()

  const [baseData, setBaseData] = useState<OutputData | null>(null)
  const [targetData, setTargetData] = useState<OutputData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  if (!documentId || !baseCommitId || !targetCommitId) {
    throw new Error("Invalid search params")
  }

  useEffect(() => {
    // 실제로는 API를 통해 데이터를 가져와야 합니다
    const loadData = async () => {
      setIsLoading(true)

      // 시뮬레이션을 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 500))

      // TODO: 실제 API 호출로 대체
      // const baseResponse = await fetch(`/api/documents/${documentId}/commits/${baseCommitId}`)
      // const targetResponse = await fetch(`/api/documents/${documentId}/commits/${targetCommitId}`)

      // 임시 데이터 - 실제로는 API에서 가져온 데이터 사용
      const mockBaseData: OutputData = {
        ...EditData,
        blocks: [
          {
            id: "1",
            type: "paragraph",
            data: {
              text: "이것은 기본 브랜치의 문서입니다.",
            },
          },
          {
            id: "2",
            type: "header",
            data: {
              text: "공통 섹션",
              level: 2,
            },
          },
          {
            id: "3",
            type: "paragraph",
            data: {
              text: "이 부분은 양쪽 브랜치에서 동일합니다.",
            },
          },
          {
            id: "4",
            type: "paragraph",
            data: {
              text: "기본 브랜치에만 있는 내용입니다.",
            },
          },
        ],
      }

      const mockTargetData: OutputData = {
        ...EditData,
        blocks: [
          {
            id: "1",
            type: "paragraph",
            data: {
              text: "이것은 대상 브랜치의 수정된 문서입니다.",
            },
          },
          {
            id: "2",
            type: "header",
            data: {
              text: "공통 섹션",
              level: 2,
            },
          },
          {
            id: "3",
            type: "paragraph",
            data: {
              text: "이 부분은 양쪽 브랜치에서 동일합니다.",
            },
          },
          {
            id: "5",
            type: "paragraph",
            data: {
              text: "대상 브랜치에 추가된 새로운 내용입니다.",
            },
          },
          {
            id: "6",
            type: "list",
            data: {
              style: "unordered",
              items: ["새로운 기능 1", "새로운 기능 2", "새로운 기능 3"],
            },
          },
        ],
      }

      setBaseData(mockBaseData)
      setTargetData(mockTargetData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const handleSave = async (mergedData: OutputData) => {
    console.log("Saving merged data:", mergedData)

    // TODO: 실제 API 호출로 대체
    // await fetch(`/api/documents/${documentId}/merge`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     baseCommitId,
    //     targetCommitId,
    //     mergedData
    //   })
    // })

    // 성공 후 문서 상세 페이지로 이동
    navigate(`/documents/${documentId}`)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (isLoading || !baseData || !targetData) {
    return <Loading text="병합 데이터를 불러오는 중..." />
  }

  return (
    <DocumentMergeView
      baseData={baseData}
      targetData={targetData}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
