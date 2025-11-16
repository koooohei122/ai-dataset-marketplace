// プロジェクト管理用の簡易ストレージ（本番環境ではデータベースを使用）
// 実際には外部ストレージ（Redis、データベース等）を使用
// 注意: この実装はメモリ内のみで、サーバー再起動でデータが失われます
// 本番環境ではデータベースを使用してください

const projects = new Map<string, any>();

export function getProject(projectId: string) {
  return projects.get(projectId);
}

export function setProject(projectId: string, project: any) {
  projects.set(projectId, project);
}

export function deleteProject(projectId: string) {
  projects.delete(projectId);
}

export function getAllProjects() {
  return Array.from(projects.entries()).map(([id, project]) => ({
    id,
    ...project,
  }));
}

