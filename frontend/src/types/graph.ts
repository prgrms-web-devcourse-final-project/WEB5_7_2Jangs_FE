export interface Commit {
  id: number
  branchId: number
  title: string
  description: string
  createdAt: string
}

export interface GraphEdge {
  from: number
  to: number
}

export interface Branch {
  id: number
  name: string
  createdAt: string
  fromCommitId: number | null
  rootCommitId: number
  leafCommitId: number
  tempId: number | null
}

export interface GraphDataType {
  title: string
  commits: Commit[]
  edges: GraphEdge[]
  branches: Branch[]
}

export interface DocumentGraphProps {
  data: GraphDataType
  currentCommitId: string | null
  onNodeMenuClick: (
    type: "view" | "compare" | "continueEdit" | "delete" | "merge",
    commitId: number,
  ) => void
}

export interface HoveredCommit {
  commit: Commit
  position: { x: number; y: number }
}
