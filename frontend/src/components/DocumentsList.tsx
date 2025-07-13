import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  Grid3X3,
  List,
  Edit,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { useNavigate } from "react-router"
import Loading from "./Loading"
import { type Document, DocumentList } from "@/mock/DocumentList"
import { formatDate, formatDateForDocuments } from "@/lib/date"

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newDocumentTitle, setNewDocumentTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    // 문서 데이터 로드 시뮬레이션
    const loadDocuments = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setDocuments(DocumentList)
      setIsLoading(false)
    }

    loadDocuments()
  }, [])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDocumentClick = (id: number) => {
    console.log(`문서 ${id} 열기`)
    // 실제로는 문서 편집 페이지로 이동
    navigate(`/documents/${id}`)
  }

  const handleEditTitle = (id: number) => {
    console.log(`문서 ${id} 제목 수정`)
    // 실제로는 제목 수정 모달 또는 인라인 편집
    const newTitle = prompt("새 제목을 입력하세요:")
    if (newTitle?.trim()) {
      setDocuments((docs) =>
        docs.map((doc) =>
          doc.id === id ? { ...doc, title: newTitle.trim() } : doc,
        ),
      )
    }
  }

  const openCreateModal = () => {
    setIsCreateModalOpen(true)
    setNewDocumentTitle("")
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setNewDocumentTitle("")
    setIsCreating(false)
  }

  const handleDeleteDocument = (id: number) => {
    console.log(`문서 ${id} 삭제`)
    // 실제로는 삭제 확인 모달
    if (confirm("정말로 이 문서를 삭제하시겠습니까?")) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id))
    }
  }

  const createNewDocument = async () => {
    if (!newDocumentTitle.trim()) return

    setIsCreating(true)
    try {
      // 새 문서 생성 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      closeCreateModal()
      console.log("새 문서 생성됨")
    } catch (error) {
      console.error("문서 생성 실패:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return <Loading text="문서를 불러오는 중..." />
  }

  return (
    <div className="h-full bg-slate-50">
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 및 새 문서 생성 */}
        <div className="mb-8 flex items-center gap-4">
          {/* 검색 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="문서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-slate-200 focus:border-slate-800 focus:ring-slate-800 text-base"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>

          {/* 새 문서 생성 버튼 */}
          <Button
            onClick={openCreateModal}
            className="bg-slate-800 hover:bg-slate-900 text-white h-12 px-6 text-base"
          >
            <Plus className="h-4 w-4 mr-2" />새 문서 만들기
          </Button>
        </div>

        {/* 문서 리스트 */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              {searchQuery ? "검색 결과가 없습니다" : "문서가 없습니다"}
            </h3>
            <p className="text-slate-500">
              {searchQuery
                ? "다른 검색어를 시도해보세요"
                : "새 문서를 만들어 시작해보세요"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:bg-white group relative"
                onClick={() => handleDocumentClick(doc.id)}
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
                            {doc.preview}
                          </p>
                        </div>
                      </div>

                      {/* 문서 정보 */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          최종편집일: {formatDateForDocuments(doc.updatedAt)}
                        </p>
                        <p className="text-sm text-slate-400">
                          최초생성일: {formatDate(doc.createdAt)}
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
                                handleEditTitle(doc.id)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              제목 수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDocument(doc.id)
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
                          {doc.title}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          최종편집일: {formatDateForDocuments(doc.updatedAt)}
                        </p>
                        <p className="text-sm text-slate-400 truncate">
                          최초생성일: {formatDate(doc.createdAt)}
                        </p>
                        <p className="text-sm text-slate-600 truncate mt-1">
                          {doc.preview}
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
                                handleEditTitle(doc.id)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              제목 수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDocument(doc.id)
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
            ))}
          </div>
        )}
      </main>
      {/* 새 문서 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              새 문서 만들기
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600">
              새로운 문서의 제목을 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="document-title"
                className="text-base font-medium text-slate-700"
              >
                문서 제목
              </Label>
              <Input
                id="document-title"
                type="text"
                placeholder="문서 제목을 입력하세요"
                value={newDocumentTitle}
                onChange={(e) => setNewDocumentTitle(e.target.value)}
                className="h-12 text-base border-slate-200 focus:border-slate-800 focus:ring-slate-800"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isCreating &&
                    newDocumentTitle.trim()
                  ) {
                    createNewDocument()
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={closeCreateModal}
              disabled={isCreating}
              className="text-base border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              취소
            </Button>
            <Button
              onClick={createNewDocument}
              disabled={!newDocumentTitle.trim() || isCreating}
              className="bg-slate-800 hover:bg-slate-900 text-white text-base"
            >
              {isCreating ? "생성 중..." : "문서 생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
