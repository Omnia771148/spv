"use client";

import { useEffect } from "react";

export default function LifecycleListener() {
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log("reloading...");
                window.location.reload();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    return null;
}
