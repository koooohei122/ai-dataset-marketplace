'use client';

import { useState } from 'react';

type ProjectStatus = 'idle' | 'specifying' | 'coding' | 'testing' | 'reviewing' | 'deploying' | 'completed' | 'error';

interface Project {
  id: string;
  requirement: string;
  status: ProjectStatus;
  progress: number;
  specification?: string;
  code?: string;
  testResults?: any;
  review?: any;
  deployUrl?: string;
  error?: string;
}

export default function AutomationPage() {
  const [requirement, setRequirement] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;

    setIsProcessing(true);
    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      requirement,
      status: 'specifying',
      progress: 0,
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setRequirement('');

    try {
      // 自動化基盤APIを呼び出し
      const response = await fetch('/api/automation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const data = await response.json();
      
      // WebSocketまたはポーリングで進捗を更新
      await pollProgress(projectId);
    } catch (error) {
      console.error('Error:', error);
      setCurrentProject({
        ...newProject,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollProgress = async (projectId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/automation/${projectId}/status`);
        if (!response.ok) return;

        const data = await response.json();
        setCurrentProject(data);
        setProjects(prev => prev.map(p => p.id === projectId ? data : p));

        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
      }
    }, 2000);

    // 5分でタイムアウト
    setTimeout(() => clearInterval(interval), 300000);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'specifying': return 'text-blue-600';
      case 'coding': return 'text-purple-600';
      case 'testing': return 'text-yellow-600';
      case 'reviewing': return 'text-orange-600';
      case 'deploying': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'idle': return '待機中';
      case 'specifying': return '仕様書生成中';
      case 'coding': return 'コード生成中';
      case 'testing': return 'テスト実行中';
      case 'reviewing': return 'レビュー中';
      case 'deploying': return 'デプロイ中';
      case 'completed': return '完了';
      case 'error': return 'エラー';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI自動化開発基盤
          </h1>
          <p className="text-lg text-gray-600">
            要件を入力するだけで、仕様書からコード、テスト、レビュー、デプロイまで自動化
          </p>
        </div>

        {/* 要件入力フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">要件入力</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 mb-2">
                作りたいシステムの要件を記述してください
              </label>
              <textarea
                id="requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: ユーザー認証機能付きのタスク管理アプリを作成してください。ログイン、タスクの追加・編集・削除、完了状態の管理ができるようにしてください。"
                disabled={isProcessing}
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !requirement.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? '処理中...' : '自動開発を開始'}
            </button>
          </form>
        </div>

        {/* 現在のプロジェクト進捗 */}
        {currentProject && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">現在のプロジェクト</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">要件</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{currentProject.requirement}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${getStatusColor(currentProject.status)}`}>
                    {getStatusLabel(currentProject.status)}
                  </span>
                  <span className="text-sm text-gray-500">{currentProject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentProject.progress}%` }}
                  />
                </div>
              </div>

              {currentProject.specification && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">生成された仕様書</h3>
                  <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-60">
                    {currentProject.specification}
                  </pre>
                </div>
              )}

              {currentProject.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">{currentProject.error}</p>
                </div>
              )}

              {currentProject.deployUrl && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800 font-medium mb-2">デプロイ完了！</p>
                  <a
                    href={currentProject.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {currentProject.deployUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* プロジェクト履歴 */}
        {projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">プロジェクト履歴</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setCurrentProject(project)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">{project.requirement}</p>
                    <span className={`ml-4 text-sm font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

