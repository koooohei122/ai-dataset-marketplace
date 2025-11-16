import { NextRequest, NextResponse } from 'next/server';
import { AutomationEngine } from '@/lib/ai/automation';
import { DeployEngine } from '@/lib/automation/deploy';
import { getProject, setProject } from '@/lib/automation/storage';

// プロジェクト管理用の簡易ストレージ（本番環境ではデータベースを使用）

// グローバルインスタンス（実際にはシングルトンパターンを使用）
const automationEngine = new AutomationEngine({
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4', // GPT-4 を使用
});

const deployEngine = new DeployEngine({
  vercelToken: process.env.VERCEL_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { requirement } = await request.json();

    if (!requirement || typeof requirement !== 'string') {
      return NextResponse.json(
        { error: '要件が指定されていません' },
        { status: 400 }
      );
    }

    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // プロジェクトを作成
    const project = {
      id: projectId,
      requirement,
      status: 'specifying',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setProject(projectId, project);

    // 非同期で自動化プロセスを開始
    processAutomation(projectId, requirement).catch(console.error);

    return NextResponse.json({ projectId, project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'プロジェクトの作成に失敗しました' },
      { status: 500 }
    );
  }
}

async function processAutomation(projectId: string, requirement: string) {
  const project = getProject(projectId);
  if (!project) return;

  try {
    // 1. 仕様書生成
    project.status = 'specifying';
    project.progress = 10;
    setProject(projectId, project);
    
    const specification = await generateSpecification(requirement);
    project.specification = specification;
    project.progress = 30;
    setProject(projectId, project);

    // 2. コード生成
    project.status = 'coding';
    project.progress = 40;
    setProject(projectId, project);
    
    const code = await generateCode(specification, requirement);
    project.code = code;
    project.progress = 60;
    setProject(projectId, project);

    // 3. テスト生成・実行
    project.status = 'testing';
    project.progress = 70;
    setProject(projectId, project);
    
    const testResults = await generateAndRunTests(code, specification);
    project.testResults = testResults;
    project.progress = 80;
    setProject(projectId, project);

    // 4. レビュー
    project.status = 'reviewing';
    project.progress = 85;
    setProject(projectId, project);
    
    const review = await reviewCode(code, specification, testResults);
    project.review = review;
    project.progress = 90;
    setProject(projectId, project);

    // レビューで問題があれば修正
    if (review.issues && review.issues.length > 0) {
      project.status = 'coding';
      project.progress = 70;
      setProject(projectId, project);
      
      const fixedCode = await fixCode(code, review.issues);
      project.code = fixedCode;
      project.progress = 85;
      setProject(projectId, project);
    }

    // 5. デプロイ
    project.status = 'deploying';
    project.progress = 95;
    setProject(projectId, project);
    
    const deployUrl = await deployProject(code, projectId);
    project.deployUrl = deployUrl;
    project.status = 'completed';
    project.progress = 100;
    setProject(projectId, project);

  } catch (error) {
    project.status = 'error';
    project.error = error instanceof Error ? error.message : 'Unknown error';
    setProject(projectId, project);
  }
}

async function generateSpecification(requirement: string): Promise<string> {
  const spec = await automationEngine.generateSpecification(requirement);
  return JSON.stringify(spec, null, 2);
}

async function generateCode(specification: string, requirement: string): Promise<any> {
  const spec = JSON.parse(specification);
  const code = await automationEngine.generateCode(spec, requirement);
  return code;
}

async function generateAndRunTests(code: any, specification: string): Promise<any> {
  const spec = JSON.parse(specification);
  const testResults = await automationEngine.generateAndRunTests(code, spec);
  return testResults;
}

async function reviewCode(code: any, specification: string, testResults: any): Promise<any> {
  const spec = JSON.parse(specification);
  const review = await automationEngine.reviewCode(code, spec, testResults);
  return review;
}

async function fixCode(code: any, issues: any[]): Promise<any> {
  const fixedCode = await automationEngine.fixCode(code, issues);
  return fixedCode;
}

async function deployProject(code: any, projectId: string): Promise<string> {
  const deployResult = await deployEngine.deployProject(code, projectId);
  return deployResult.url;
}

