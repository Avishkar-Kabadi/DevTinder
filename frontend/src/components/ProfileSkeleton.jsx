import React from 'react';

export default function ProfileSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-pulse text-gray-100">
            <div className="w-10 h-10 bg-white/10 rounded-full mb-6"></div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start mb-10 px-4 mt-4 glass-panel p-8 rounded-[2rem]">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white/10 shrink-0"></div>

                <div className="flex-1 flex flex-col items-center md:items-start w-full mt-4 md:mt-0">
                    <div className="h-8 bg-white/10 rounded-lg w-48 mb-4"></div>
                    
                    <div className="h-5 bg-white/5 rounded-md w-64 mb-4"></div>
                    
                    <div className="space-y-2 w-full max-w-lg mb-6 text-center md:text-left">
                        <div className="h-4 bg-white/5 rounded-md w-full"></div>
                        <div className="h-4 bg-white/5 rounded-md w-11/12"></div>
                        <div className="h-4 bg-white/5 rounded-md w-4/5"></div>
                    </div>

                    <div className="flex gap-3">
                        <div className="h-10 bg-white/10 rounded-xl w-32"></div>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-white/5 pt-6 mt-4">
                 <div className="flex justify-center mb-6">
                     <div className="h-4 bg-white/10 rounded-md w-24"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                     <div className="h-40 bg-white/5 rounded-2xl w-full"></div>
                     <div className="h-40 bg-white/5 rounded-2xl w-full"></div>
                 </div>
            </div>
        </div>
    );
}
