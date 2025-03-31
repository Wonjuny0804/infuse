"use client";

import dynamic from "next/dynamic";

// Import the client component with SSR disabled
const EmailsPageClient = dynamic(() => import("./EmailsPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      Loading emails...
    </div>
  ),
});

export default function EmailsPage() {
  return <EmailsPageClient />;
}
