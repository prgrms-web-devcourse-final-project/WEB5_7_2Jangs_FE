export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return ""

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "")
}

export const formatDateForDocuments = (dateInput?: string | Date) => {
  if (!dateInput) return ""

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "어제"
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
