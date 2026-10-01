import React from 'react';

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-borderLight p-4 space-y-4 shadow-xs animate-pulse">
      <div className="w-full aspect-video bg-slate-200 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function LessonPlayerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="w-full aspect-video bg-slate-300 rounded-xl"></div>
      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  );
}
