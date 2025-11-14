/**
 * Reviewing Animation Component
 *
 * Displays animated glowing doctors/scientists while review is in progress
 * - Editor stage: 1 glowing doctor
 * - Review stage: 2 glowing scientists working in parallel
 */

'use client';

import { useEffect, useState } from 'react';

interface ReviewingAnimationProps {
  stage: 'editor' | 'reviewers';
  message: string;
}

export default function ReviewingAnimation({
  stage,
  message,
}: ReviewingAnimationProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-blue-400"></div>
          ))}
        </div>
      </div>

      {/* Animated molecules/particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Editor or Reviewers */}
      <div className="relative z-10 h-full flex items-center justify-center gap-16">
        {stage === 'editor' ? (
          // Single Doctor for Editor
          <DoctorFigure label="Dr. Eric Topol" pulse={pulse} />
        ) : (
          // Two Scientists for Reviewers
          <>
            <ScientistFigure label="Reviewer 1" pulse={pulse} delay={0} />
            <ScientistFigure
              label="Reviewer 2"
              pulse={pulse}
              delay={50}
            />
          </>
        )}
      </div>

      {/* Status Message */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-block bg-slate-800 bg-opacity-80 px-6 py-3 rounded-lg backdrop-blur-sm">
          <p className="text-blue-300 font-medium">{message}</p>
          <div className="mt-2 flex justify-center gap-1">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

interface FigureProps {
  label: string;
  pulse: number;
  delay?: number;
}

function DoctorFigure({ label, pulse }: FigureProps) {
  const glowIntensity = 0.5 + Math.sin(pulse * 0.1) * 0.5;

  return (
    <div className="flex flex-col items-center">
      {/* Doctor SVG with glow effect */}
      <div className="relative">
        {/* Glow layers */}
        <div
          className="absolute inset-0 blur-xl transition-opacity duration-300"
          style={{
            opacity: glowIntensity,
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
        <div
          className="absolute inset-0 blur-md transition-opacity duration-300"
          style={{
            opacity: glowIntensity * 0.8,
            background:
              'radial-gradient(circle, rgba(96, 165, 250, 0.8) 0%, transparent 70%)',
            transform: 'scale(1.3)',
          }}
        />

        {/* Doctor figure */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="relative z-10"
        >
          {/* Lab coat */}
          <path
            d="M35 35 L35 85 L45 85 L45 50 L55 50 L55 85 L65 85 L65 35 L50 30 Z"
            fill="#e0f2fe"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {/* Head */}
          <circle
            cx="50"
            cy="20"
            r="12"
            fill="#fef3c7"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {/* Stethoscope */}
          <path
            d="M45 35 Q40 40 40 45 M55 35 Q60 40 60 45"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="40" cy="45" r="3" fill="#3b82f6" />
          <circle cx="60" cy="45" r="3" fill="#3b82f6" />
          {/* Clipboard */}
          <rect
            x="55"
            y="55"
            width="15"
            height="20"
            fill="white"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <line
            x1="58"
            y1="60"
            x2="67"
            y2="60"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <line
            x1="58"
            y1="65"
            x2="67"
            y2="65"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <line
            x1="58"
            y1="70"
            x2="67"
            y2="70"
            stroke="#3b82f6"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Label */}
      <p className="mt-4 text-blue-300 font-semibold text-sm">{label}</p>
      <p className="text-blue-400 text-xs">Reviewing...</p>
    </div>
  );
}

function ScientistFigure({ label, pulse, delay = 0 }: FigureProps) {
  const glowIntensity = 0.5 + Math.sin((pulse + delay) * 0.1) * 0.5;

  return (
    <div className="flex flex-col items-center">
      {/* Scientist SVG with glow effect */}
      <div className="relative">
        {/* Glow layers */}
        <div
          className="absolute inset-0 blur-xl transition-opacity duration-300"
          style={{
            opacity: glowIntensity,
            background:
              'radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, transparent 70%)',
            transform: 'scale(1.5)',
          }}
        />
        <div
          className="absolute inset-0 blur-md transition-opacity duration-300"
          style={{
            opacity: glowIntensity * 0.8,
            background:
              'radial-gradient(circle, rgba(74, 222, 128, 0.8) 0%, transparent 70%)',
            transform: 'scale(1.3)',
          }}
        />

        {/* Scientist figure */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="relative z-10"
        >
          {/* Lab coat */}
          <path
            d="M35 35 L35 85 L45 85 L45 50 L55 50 L55 85 L65 85 L65 35 L50 30 Z"
            fill="#d1fae5"
            stroke="#22c55e"
            strokeWidth="2"
          />
          {/* Head */}
          <circle
            cx="50"
            cy="20"
            r="12"
            fill="#fef3c7"
            stroke="#22c55e"
            strokeWidth="2"
          />
          {/* Glasses */}
          <circle
            cx="45"
            cy="20"
            r="4"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <circle
            cx="55"
            cy="20"
            r="4"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <line
            x1="49"
            y1="20"
            x2="51"
            y2="20"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          {/* Microscope */}
          <g transform="translate(30, 55)">
            <rect
              x="0"
              y="20"
              width="20"
              height="3"
              fill="#22c55e"
            />
            <rect x="8" y="10" width="4" height="10" fill="#22c55e" />
            <circle cx="10" cy="8" r="5" fill="none" stroke="#22c55e" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Label */}
      <p className="mt-4 text-green-300 font-semibold text-sm">{label}</p>
      <p className="text-green-400 text-xs">Analyzing...</p>
    </div>
  );
}
