import { Skeleton } from "@/components/ui/skeleton";

export const SimilarItemsSkeleton = () => (
  <div className="mt-16 mb-12">
    <div className="flex flex-col mb-8 px-2">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-64" />
    </div>
    <div className="overflow-x-auto scrollbar-hide pb-6 -mx-4 px-4">
      <div className="flex gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-72 bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
