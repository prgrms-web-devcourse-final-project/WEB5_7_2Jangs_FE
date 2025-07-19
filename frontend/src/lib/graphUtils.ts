// 브랜치 색상 팔레트
export const COLOR_PALETTE = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#a855f7", // purple
  "#22c55e", // green
  "#3b82f6", // blue
  "#f43f5e", // rose
  "#eab308", // yellow
  "#6366f1", // indigo
] as const

// 브랜치 이름을 기반으로 해시 생성
export function stringToHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// 브랜치별 색상 생성 함수
export function getBranchColor(branchName: string): string {
  // main 브랜치는 indigo 색상 유지
  if (branchName === "main") {
    return "#6366f1"
  }

  // 브랜치 이름을 기반으로 색상 선택
  const hash = stringToHash(branchName)
  const colorIndex = hash % COLOR_PALETTE.length
  return COLOR_PALETTE[colorIndex]
}

// 그래프 레이아웃 상수
export const GRAPH_LAYOUT = {
  BRANCH_SPACING: 250,
  BASE_X_OFFSET: 150,
  BASE_Y_OFFSET: 100,
  HEIGHT_RANGE: 400,
  NODE_WIDTH: 180,
} as const
