import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Grid3X3, List } from "lucide-react"

interface SearchAndCreateBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: "grid" | "list"
  toggleViewMode: () => void
  onCreateClick: () => void
  sort: "title" | "updatedAt"
  setSort: (sort: "title" | "updatedAt") => void
  order: "asc" | "desc"
  setOrder: (order: "asc" | "desc") => void
}

export default function SearchAndCreateBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  toggleViewMode,
  onCreateClick,
  sort,
  setSort,
  order,
  setOrder,
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

      {/* 정렬 옵션 */}
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-32 h-12">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">수정일</SelectItem>
            <SelectItem value="title">제목</SelectItem>
          </SelectContent>
        </Select>

        <Select value={order} onValueChange={setOrder}>
          <SelectTrigger className="w-28 h-12">
            <SelectValue placeholder="순서" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">내림차순</SelectItem>
            <SelectItem value="asc">오름차순</SelectItem>
          </SelectContent>
        </Select>
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
