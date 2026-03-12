import React from 'react';

export default function PostSkeleton() {
    return (
        <div className="glass-panel p-5 rounded-3xl mb-6 w-full animate-pulse border border-white/5">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/10 shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded-md w-1/3"></div>
                    <div className="h-3 bg-white/5 rounded-md w-1/4"></div>
                </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3 mb-4">
                <div className="h-4 bg-white/10 rounded-md w-full"></div>
                <div className="h-4 bg-white/10 rounded-md w-11/12"></div>
                <div className="h-4 bg-white/10 rounded-md w-4/5"></div>
            </div>

            {/* Optional Image Block */}
            <div className="h-64 bg-white/5 rounded-2xl w-full mb-4"></div>

            {/* Footer Actions */}
            <div className="flex gap-4 border-t border-white/5 pt-4">
                <div className="h-8 bg-white/10 rounded-lg w-20"></div>
                <div className="h-8 bg-white/10 rounded-lg w-20"></div>
            </div>
        </div>
    );
}
