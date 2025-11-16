import { NextRequest, NextResponse } from 'next/server';

// プロジェクト管理用の簡易ストレージ（本番環境ではデータベースを使用）
// 実際には外部ストレージ（Redis、データベース等）を使用
// 注意: この実装はメモリ内のみで、サーバー再起動でデータが失われます
// 本番環境ではデータベースを使用してください
const projects = new Map<string, any>();

// グローバルストレージとして使用（実際には外部ストレージが必要）
export { projects };

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    // 実際にはデータベースから取得
    const project = projects.get(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project status:', error);
    return NextResponse.json(
      { error: 'ステータスの取得に失敗しました' },
      { status: 500 }
    );
  }
}

