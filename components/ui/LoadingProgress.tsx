/**
 * Loading Progress Component
 *
 * Displays review progress with animated indicators and status messages.
 */

'use client';

interface LoadingProgressProps {
  progress: number;
  currentStage: string;
  error: string | null;
}

export default function LoadingProgress({
  progress,
  currentStage,
  error,
}: LoadingProgressProps) {
  const stages = [
    { name: 'Extracting text', icon: '📄' },
    { name: 'Fetching criteria', icon: '📋' },
    { name: 'Editorial assessment', icon: '👨‍⚕️' },
    { name: 'Reviewer feedback', icon: '🔬' },
    { name: 'Synthesis', icon: '🧠' },
    { name: 'Complete', icon: '✅' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Review in Progress
        </h2>
        <p className="text-sm text-slate-600">{currentStage}</p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-2 text-center text-sm font-medium text-slate-700">
          {progress}%
        </div>
      </div>

      {/* Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stages.map((stage, index) => (
          <div
            key={stage.name}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300
              ${
                progress > index * 20
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-200 bg-white'
              }
            `}
          >
            <div className="text-2xl mb-1">{stage.icon}</div>
            <div className="text-xs font-medium text-slate-700">{stage.name}</div>
          </div>
        ))}
      </div>

      {/* Animated Spinner */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-200"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>Please wait:</strong> The review process involves multiple AI agents
          analyzing your article. This typically takes 2-5 minutes depending on article
          length and complexity.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
