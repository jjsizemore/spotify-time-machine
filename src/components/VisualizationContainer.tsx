import React, { Suspense } from 'react';

type VisualizationContainerProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function VisualizationSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-spotify-dark-gray rounded-lg p-6 animate-pulse">
      <div className="h-8 w-64 bg-spotify-medium-gray/50 rounded mb-6"></div>
      <div className="flex justify-center items-center p-12">
        <div className="text-spotify-light-gray">Loading {title}...</div>
      </div>
    </div>
  );
}

export default function VisualizationContainer({
  title,
  children,
  className = 'mb-8'
}: VisualizationContainerProps) {
  return (
    <div className={className}>
      <Suspense fallback={<VisualizationSkeleton title={title} />}>
        {children}
      </Suspense>
    </div>
  );
}