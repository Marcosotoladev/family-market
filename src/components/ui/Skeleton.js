'use client';

import { cn } from "@/lib/utils";

/**
 * Skeleton component for loading states
 * @param {string} className - Additional classes
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Div props
 */
export default function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
            {...props}
        />
    );
}
