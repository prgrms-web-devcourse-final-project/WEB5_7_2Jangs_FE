export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return ""

  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "")
}

export const formatDateForDocuments = (dateInput?: string | Date) => {
  if (!dateInput) return ""

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput

  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "")
}
