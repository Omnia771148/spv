'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth(redirectTo = "/login") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      // Redirect if not authenticated
      router.replace(redirectTo);
    } else {
      setLoading(false);
    }
  }, [router, redirectTo]);

  return loading; 
}
