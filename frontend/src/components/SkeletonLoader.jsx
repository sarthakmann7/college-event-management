import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl flex flex-col space-y-4">
      {/* Banner Skeleton */}
      <div className="w-full h-48 rounded-xl shimmer"></div>
      
      {/* Category & Badge Skeleton */}
      <div className="flex justify-between items-center">
        <div className="w-20 h-6 rounded-full shimmer"></div>
        <div className="w-16 h-6 rounded-full shimmer"></div>
      </div>

      {/* Title Skeleton */}
      <div className="w-3/4 h-7 rounded shimmer"></div>

      {/* Description Skeleton */}
      <div className="space-y-2">
        <div className="w-full h-4 rounded shimmer"></div>
        <div className="w-5/6 h-4 rounded shimmer"></div>
      </div>

      {/* Date/Venue Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="w-1/3 h-5 rounded shimmer"></div>
        <div className="w-1/4 h-5 rounded shimmer"></div>
      </div>

      {/* Footer / Slots & Button Skeleton */}
      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
        <div className="w-1/3 h-5 rounded shimmer"></div>
        <div className="w-24 h-10 rounded-xl shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
