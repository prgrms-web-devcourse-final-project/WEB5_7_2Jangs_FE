import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreVertical, Edit, Trash2 } from "lucide-react"
import type { Document } from "@/mock/DocumentList"
import { formatDate, formatDateForDocuments } from "@/lib/date"

interface DocumentCardProps {
  document: Document
  viewMode: "grid" | "list"
  onDocumentClick: (doc: Document) => void
  onEditTitle: (id: number) => void
  onDeleteDocument: (doc: Document) => void
}

export default function DocumentCard({
  document,
  viewMode,
  onDocumentClick,
  onEditTitle,
  onDeleteDocument,
}: DocumentCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:bg-white group relative"
      onClick={() => onDocumentClick(document)}
    >
      <CardContent className="p-0">
        {viewMode === "grid" ? (
          // 그리드 뷰
          <div className="p-6">
            {/* 미리보기 영역 */}
            <div className="h-32 bg-slate-50 rounded-lg mb-4 p-4 border border-slate-100 group-hover:border-slate-200 transition-colors">
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
                  {document.preview}
                </p>
              </div>
            </div>

            {/* 문서 정보 */}
            <div className="space-y-2">
              <h3 className="font-medium text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                {document.title}
              </h3>
              <p className="text-sm text-slate-500">
                최종편집일: {formatDateForDocuments(document.updatedAt)}
              </p>
              <p className="text-sm text-slate-400">
                최초생성일: {formatDate(document.createdAt)}
              </p>
            </div>

            {/* 더보기 버튼 */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTitle(document.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    제목 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteDocument(document)
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          // 리스트 뷰
          <div className="p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                {document.title}
              </h3>
              <p className="text-sm text-slate-500 truncate">
                최종편집일: {formatDateForDocuments(document.updatedAt)}
              </p>
              <p className="text-sm text-slate-400 truncate">
                최초생성일: {formatDate(document.createdAt)}
              </p>
              <p className="text-sm text-slate-600 truncate mt-1">
                {document.preview}
              </p>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTitle(document.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    제목 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteDocument(document)
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
