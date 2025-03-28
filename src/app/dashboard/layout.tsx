"use client";

import SideMenu from "@/components/SideMenu";
import { GridBackground } from "@/app/components/GridBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen relative">
      <GridBackground />
      <div className="absolute inset-0 -z-10 bg-grid-pattern bg-gray-50" />
      <SideMenu />

      {/* Main Content - takes full width */}
      <main className="flex-1 overflow-auto w-full">
        <div className="h-full w-full flex items-center justify-center p-6 pl-24">
          {children}
        </div>
      </main>
    </div>
  );
}
