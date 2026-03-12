import { useState, useEffect } from "react";

export default function useOnline() {
    // 1. Initialize with current status
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // 2. Attach listeners on mount
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // 3. CLEANUP: Remove listeners on unmount
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []); // Empty dependency array means this runs only once

    return isOnline;
}