import Skeleton from "@/components/ui/Skeleton"

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Image Placeholder */}
            <Skeleton className="h-64 w-full rounded-none" />

            <div className="p-5 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />

                {/* Price */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>

                {/* Button */}
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    )
}
