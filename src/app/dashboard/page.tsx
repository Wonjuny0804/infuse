"use client";

// import { useEffect } from "react";
import useUser from "@/hooks/useUser";
// import { useRouter } from "next/navigation";

export default function DashboardPage() {
  // const router = useRouter();
  const user = useUser();

  // Initialize chat hook

  // useEffect(() => {
  //   // Redirect if no user
  //   if (user === null) {
  //     router.push("/");
  //   }
  // }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center p-4"></div>
  );
}
