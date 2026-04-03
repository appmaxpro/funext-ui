export const Skeleton = ({ count = 1 }: { count?: number }) => {
  return Array.from({ length: count }).map((_, i) => <SkeletonItem key={i} />);
};

const SkeletonItem = () => (
  <div className="mx-auto w-full rounded-md border-1 p-4">
    <div className="flex animate-pulse space-x-4">
      <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="col-span-1 h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-2 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  </div>
);
