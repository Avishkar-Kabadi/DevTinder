import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export default function GlobalAlerts() {
    const [toast, setToast] = useState(null);
    const [confirmData, setConfirmData] = useState(null);

    useEffect(() => {
        const handleToast = (e) => {
            setToast({ ...e.detail, id: Date.now() });
        };
        const handleConfirm = (e) => {
            setConfirmData(e.detail);
        };

        window.addEventListener('showToastAlert', handleToast);
        window.addEventListener('showConfirmAlert', handleConfirm);

        return () => {
            window.removeEventListener('showToastAlert', handleToast);
            window.removeEventListener('showConfirmAlert', handleConfirm);
        };
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleResolve = (result) => {
        if (confirmData?.resolve) confirmData.resolve(result);
        setConfirmData(null);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] flex flex-col items-center justify-center p-4">
            
            {/* Instagram Style Centered Toast */}
            {toast && (
                <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-4 bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto border border-white/10">
                    {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                    {toast.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-400" />}
                    {toast.type === 'error' && <X className="w-6 h-6 text-red-400" />}
                    {toast.type === 'info' && <Info className="w-6 h-6 text-blue-400" />}
                    <span className="font-medium text-base tracking-wide drop-shadow-md">{toast.message}</span>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmData && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-white/10 w-full max-w-[320px] rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">{confirmData.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{confirmData.message}</p>
                        </div>
                        <div className="flex flex-col border-t border-white/10">
                            <button 
                                onClick={() => handleResolve(true)} 
                                className="w-full py-3.5 text-red-500 font-bold active:bg-white/5 transition-colors border-b border-white/10"
                            >
                                {confirmData.confirmText}
                            </button>
                            <button 
                                onClick={() => handleResolve(false)} 
                                className="w-full py-3.5 text-white active:bg-white/5 transition-colors font-medium"
                            >
                                {confirmData.cancelText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
