export const GraphData = {
  title: "문서 제목",
  commits: [
    {
      id: 11,
      branchId: 101,
      title: "이건 첫번째 커밋",
      description: "first",
      createdAt: "2025-07-07T12:00:00",
    },
    {
      id: 12,
      branchId: 101,
      title: "이건 두번째 커밋",
      description: "second",
      createdAt: "2025-07-07T15:00:00",
    },
    {
      id: 13,
      branchId: 101,
      title: "이건 세번째 커밋",
      description: "third",
      createdAt: "2025-07-07T18:00:00",
    },
    {
      id: 14,
      branchId: 102,
      title: "이건 네번째 커밋",
      description: "12에서 파생된 커밋",
      createdAt: "2025-07-07T20:00:00",
    },
  ],
  edges: [
    {
      from: 11,
      to: 12,
    },
    {
      from: 12,
      to: 13,
    },
    {
      from: 12,
      to: 14,
    },
  ],
  branches: [
    {
      id: 101,
      name: "main",
      createdAt: "2025-07-07T12:00:00",
      fromCommitId: null,
      rootCommitId: 11,
      leafCommitId: 13,
      tempId: null,
    },
    {
      id: 102,
      name: "sub1",
      createdAt: "2025-07-07T20:00:00",
      fromCommitId: 12,
      rootCommitId: 14,
      leafCommitId: 14,
      tempId: 1001,
    },
  ],
}
