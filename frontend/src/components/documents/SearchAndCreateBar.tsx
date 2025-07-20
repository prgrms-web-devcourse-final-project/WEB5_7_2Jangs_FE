import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Grid3X3, List } from "lucide-react"

interface SearchAndCreateBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: "grid" | "list"
  toggleViewMode: () => void
  onCreateClick: () => void
}

export default function SearchAndCreateBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  toggleViewMode,
  onCreateClick,
}: SearchAndCreateBarProps) {
  return (
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
        onClick={toggleViewMode}
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
        onClick={onCreateClick}
        className="bg-slate-800 hover:bg-slate-900 text-white h-12 px-6 text-base"
      >
        <Plus className="h-4 w-4 mr-2" />새 문서 만들기
      </Button>
    </div>
  )
}
