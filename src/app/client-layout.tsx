"use client";

import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen">
        {children}
      </div>
      <Toaster />
    </>
  )
}
