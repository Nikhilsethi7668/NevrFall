"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PageLoadContextType {
    isPageReady: boolean;
    setPageReady: () => void;
    componentsLoaded: Set<string>;
    markComponentLoaded: (componentName: string) => void;
}

const PageLoadContext = createContext<PageLoadContextType | undefined>(undefined);

export function PageLoadProvider({ children }: { children: ReactNode }) {
    const [isPageReady, setIsPageReady] = useState(false);
    const [componentsLoaded, setComponentsLoaded] = useState<Set<string>>(new Set());

    const markComponentLoaded = (componentName: string) => {
        setComponentsLoaded((prev) => {
            const newSet = new Set(prev);
            newSet.add(componentName);
            return newSet;
        });
    };

    const setPageReady = () => {
        setIsPageReady(true);
    };

    return (
        <PageLoadContext.Provider
            value={{ isPageReady, setPageReady, componentsLoaded, markComponentLoaded }}
        >
            {children}
        </PageLoadContext.Provider>
    );
}

export function usePageLoad() {
    const context = useContext(PageLoadContext);
    if (!context) {
        throw new Error("usePageLoad must be used within PageLoadProvider");
    }
    return context;
}
