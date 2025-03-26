"use client";

import Link from "next/link";
import { Mail, FileText, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="text-2xl font-bold text-brand-navy">Infuse</h1>
        </Link>
        <nav className="flex gap-4 ml-8">
          <Link
            href="/dashboard/gmail"
            className={`flex items-center gap-2 ${
              isActive("/dashboard/gmail")
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            Emails Dashboard
          </Link>
          <Link
            href="/summaries"
            className={`flex items-center gap-2 ${
              isActive("/summaries")
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Summaries
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-2 ${
              isActive("/settings")
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </>
  );
};

export default Navigation;
