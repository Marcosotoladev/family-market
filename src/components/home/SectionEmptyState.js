'use client';
import { ArrowRight } from 'lucide-react';

export default function SectionEmptyState({ message, subMessage, buttonText, onButtonClick }) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 font-medium text-center text-sm sm:text-base mb-1">
                {message}
            </p>
            {subMessage && (
                <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-4">
                    {subMessage}
                </p>
            )}
            {buttonText && (
                <button
                    onClick={onButtonClick}
                    className="mt-3 flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors"
                >
                    {buttonText}
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
