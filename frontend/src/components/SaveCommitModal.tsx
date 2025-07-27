import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface SaveCommitModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "save" | "commit"
  onConfirm: (data: { title: string; description?: string }) => void
  isLoading?: boolean
}

export default function SaveCommitModal({
  isOpen,
  onClose,
  mode,
  onConfirm,
  isLoading = false,
}: SaveCommitModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onConfirm({
      title: title.trim(),
      description: description.trim() || undefined,
    })

    // 폼 초기화
    setTitle("")
    setDescription("")
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>기록하기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "commit" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">커밋 제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={"커밋 제목을 입력하세요"}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">커밋 설명</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={"커밋에 대한 설명을 입력하세요"}
                  disabled={isLoading}
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={(mode === "commit" && !title.trim()) || isLoading}
            >
              {isLoading
                ? mode === "save"
                  ? "저장 중..."
                  : "기록 중..."
                : mode === "save"
                  ? "저장하기"
                  : "기록하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
