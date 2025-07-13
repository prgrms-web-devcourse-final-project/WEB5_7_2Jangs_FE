import type { OutputData } from "@editorjs/editorjs"
import { diff_match_patch } from "diff-match-patch"

// 블록 레벨에서 diff 계산
function calculateBlockDiff(oldData: OutputData, newData: OutputData) {
  const dmp = new diff_match_patch()
  const results = []

  const maxLength = Math.max(oldData.blocks.length, newData.blocks.length)

  for (let i = 0; i < maxLength; i++) {
    const oldBlock = oldData.blocks[i]
    const newBlock = newData.blocks[i]

    if (!oldBlock && newBlock) {
      // 새로 추가된 블록
      results.push({ type: "added", block: newBlock })
    } else if (oldBlock && !newBlock) {
      // 삭제된 블록
      results.push({ type: "deleted", block: oldBlock })
    } else if (oldBlock && newBlock) {
      // 수정된 블록
      const oldText = blockToText(oldBlock)
      const newText = blockToText(newBlock)

      if (oldText !== newText) {
        const diffs = dmp.diff_main(oldText, newText)
        dmp.diff_cleanupSemantic(diffs)
        results.push({ type: "modified", oldBlock, newBlock, diffs })
      } else {
        results.push({ type: "unchanged", block: oldBlock })
      }
    }
  }

  return results
}

function blockToText(block: any): string {
  switch (block.type) {
    case "paragraph":
      return block.data.text || ""
    case "header":
      return block.data.text || ""
    case "list":
      return block.data.items?.join("\n") || ""
    // ... 다른 블록 타입들
    default:
      return JSON.stringify(block.data)
  }
}
