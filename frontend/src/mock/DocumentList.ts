export interface Document {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  preview: string
}

export const DocumentList: Document[] = [
  {
    id: 1,
    title: "카카오 자소서",
    createdAt: "2025-07-06T12:00:00Z",
    updatedAt: "2025-07-07T09:00:00Z",
    preview: "카카오 가고싶다~",
  },
  {
    id: 2,
    title: "네이버 자기소개서",
    createdAt: "2025-06-28T15:30:00Z",
    updatedAt: "2025-07-01T10:45:00Z",
    preview: "네이버 가고싶다~",
  },
]
