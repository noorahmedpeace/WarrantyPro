import { cn } from "~/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
            {...props}
        />
    );
}

export function WarrantyCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <div className="space-y-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}
