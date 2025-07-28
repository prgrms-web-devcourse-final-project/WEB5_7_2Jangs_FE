import { useNavigate } from "react-router"
import Loading from "./Loading"

// Custom Hooks
import { useDocuments } from "@/hooks/useDocuments"
import { useCreateDocument } from "@/hooks/useCreateDocument"
import { useEditDocument } from "@/hooks/useEditDocument"
import { useDeleteDocument } from "@/hooks/useDeleteDocument"

// Components
import SearchAndCreateBar from "./documents/SearchAndCreateBar"
import DocumentsGrid from "./documents/DocumentsGrid"
import CreateDocumentModal from "./documents/CreateDocumentModal"
import EditDocumentModal from "./documents/EditDocumentModal"
import DeleteDocumentDialog from "./documents/DeleteDocumentDialog"
import type { DocListResponse } from "@/api/__generated__"

export default function DocumentsList() {
  const navigate = useNavigate()

  const {
    documents,
    searchQuery,
    inputValue,
    setInputValue,
    handleSearch,
    handleResetSearch,
    viewMode,
    toggleViewMode,
    isLoading,
    sort,
    setSort,
    order,
    setOrder,
  } = useDocuments()

  const createDocument = useCreateDocument()

  const editDocument = useEditDocument({ documents })

  const deleteDocument = useDeleteDocument()

  // 문서 클릭 핸들러
  const handleDocumentClick = (doc: DocListResponse) => {
    console.log(`문서 ${doc.id} 열기`)
    const { recentType, recentTypeId } = doc.recent || {}
    if (recentType === "SAVE") {
      navigate(`/documents/${doc.id}?mode=save&saveId=${recentTypeId}`)
    } else if (recentType === "COMMIT") {
      navigate(`/documents/${doc.id}?mode=commit&saveId=${recentTypeId}`)
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
        <SearchAndCreateBar
          searchQuery={searchQuery}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearch={handleSearch}
          handleResetSearch={handleResetSearch}
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onCreateClick={createDocument.openCreateModal}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
        />

        {/* 문서 리스트 */}
        <DocumentsGrid
          documents={documents}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onDocumentClick={handleDocumentClick}
          onEditTitle={editDocument.handleEditTitle}
          onDeleteDocument={deleteDocument.deleteDocument}
        />
      </main>

      {/* 새 문서 생성 모달 */}
      <CreateDocumentModal
        isOpen={createDocument.isCreateModalOpen}
        onOpenChange={createDocument.setIsCreateModalOpen}
        title={createDocument.newDocumentTitle}
        setTitle={createDocument.setNewDocumentTitle}
        isCreating={createDocument.isCreating}
        onCreateDocument={createDocument.createNewDocument}
        onClose={createDocument.closeCreateModal}
      />

      {/* 문서 제목 수정 모달 */}
      <EditDocumentModal
        isOpen={editDocument.showEditDialog}
        onOpenChange={editDocument.setShowEditDialog}
        title={editDocument.editTitle}
        setTitle={editDocument.setEditTitle}
        isUpdating={editDocument.isUpdating}
        onUpdateTitle={editDocument.confirmEditTitle}
        onCancel={editDocument.cancelEditTitle}
      />

      {/* 문서 삭제 확인 다이얼로그 */}
      <DeleteDocumentDialog
        isOpen={deleteDocument.showDeleteDialog}
        onOpenChange={deleteDocument.setShowDeleteDialog}
        document={deleteDocument.documentToDelete}
        onConfirmDelete={deleteDocument.confirmDeleteDocument}
        onCancel={deleteDocument.cancelDeleteDocument}
      />
    </div>
  )
}
