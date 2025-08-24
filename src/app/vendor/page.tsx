
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/vendor/dashboard');
    }, [router]);

    return null;
}
