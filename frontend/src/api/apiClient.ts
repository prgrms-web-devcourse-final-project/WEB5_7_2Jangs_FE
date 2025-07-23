import {
  APIApi,
  AuthApi,
  BranchControllerApi,
  CommitControllerApi,
  Configuration,
  DocControllerApi,
  SaveControllerApi,
} from "./__generated__"

export const BACKEND_API = import.meta.env.DEV ? "" : "https://3.34.159.207"

const customFetch = async (url: string, init?: RequestInit) => {
  // 새로운 init 객체 생성
  const newInit = {
    ...init,
    // headers,
  }

  // 원래의 fetch 함수 호출
  return fetch(url, newInit)
}

// API 클라이언트 설정
const config = new Configuration({
  basePath: BACKEND_API, // "http://localhost:8080",
  credentials: "include",
  fetchApi: customFetch,
})

// 모든 API 클라이언트를 하나의 객체로 통합
export const apiClient = {
  auth: new AuthApi(config),
  user: new APIApi(config),
  branch: new BranchControllerApi(config),
  commit: new CommitControllerApi(config),
  document: new DocControllerApi(config),
  save: new SaveControllerApi(config),
}
