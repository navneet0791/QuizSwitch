// app/providers.tsx
"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

type PostHogWithInit = typeof posthog & { __initialized?: boolean };

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            !(posthog as PostHogWithInit).__initialized
        ) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
                api_host:
                    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
                    "https://us.i.posthog.com",
                person_profiles: "identified_only",

                // ✅ Important for Web Analytics
                capture_pageview: true,
                capture_pageleave: true,
            });
            (posthog as any).__initialized = true; // Prevent double init
        }
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
