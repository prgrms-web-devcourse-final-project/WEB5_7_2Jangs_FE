import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditDocumentModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  setTitle: (title: string) => void
  isUpdating: boolean
  onUpdateTitle: () => void
  onCancel: () => void
}

export default function EditDocumentModal({
  isOpen,
  onOpenChange,
  title,
  setTitle,
  isUpdating,
  onUpdateTitle,
  onCancel,
}: EditDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            문서 제목 수정
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600">
            문서의 제목을 수정해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="edit-document-title"
              className="text-base font-medium text-slate-700"
            >
              문서 제목
            </Label>
            <Input
              id="edit-document-title"
              type="text"
              placeholder="문서 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-base border-slate-200 focus:border-slate-800 focus:ring-slate-800"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isUpdating && title.trim()) {
                  onUpdateTitle()
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            className="text-base border-slate-200 hover:bg-slate-50 bg-transparent"
          >
            취소
          </Button>
          <Button
            onClick={onUpdateTitle}
            disabled={!title.trim() || isUpdating}
            className="bg-slate-800 hover:bg-slate-900 text-white text-base"
          >
            {isUpdating ? "수정 중..." : "문서 수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
