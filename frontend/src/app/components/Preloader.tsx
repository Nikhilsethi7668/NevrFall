"use client";

import { useEffect, useState } from "react";
import { usePageLoad } from "../context/PageLoadContext";

export default function Preloader() {
    const [loading, setLoading] = useState(true);
    const [fading, setFading] = useState(false);
    const { isPageReady } = usePageLoad();

    useEffect(() => {
        const minDisplayTime = 1000; // Minimum 1 second display
        const maxWaitTime = 5000; // Maximum 5 seconds wait
        const startTime = Date.now();

        const handleHide = () => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);

            setTimeout(() => {
                setFading(true);
                setTimeout(() => {
                    setLoading(false);
                }, 500); // Wait for fade out animation
            }, remainingTime);
        };

        // If page is ready, hide the preloader
        if (isPageReady) {
            handleHide();
        } else {
            // Fallback: hide after max wait time even if page isn't ready
            const timeout = setTimeout(() => {
                console.warn("Preloader timeout - hiding anyway");
                handleHide();
            }, maxWaitTime);

            return () => clearTimeout(timeout);
        }
    }, [isPageReady]);

    if (!loading) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"
                }`}
        >
            <img src="/logo.svg" alt="Loading..." className="w-full animate-pulse" />
        </div>
    );
}
