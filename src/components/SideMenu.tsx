"use client";

import Link from "next/link";
import {
  ExitIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  GearIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import createClient from "@/lib/supabase/client";
const SideMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const displayName = user?.user_metadata.full_name || user?.email;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      href: "/dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/emails",
      icon: <EnvelopeClosedIcon className="w-5 h-5" />,
      label: "Emails",
    },
    {
      href: "/dashboard/summaries",
      icon: <FileTextIcon className="w-5 h-5" />,
      label: "Summaries",
    },
    {
      href: "/settings",
      icon: <GearIcon className="w-5 h-5" />,
      label: "Settings",
    },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <aside className="fixed top-0 left-0 h-full group w-16 hover:w-64 transition-all duration-300 ease-in-out bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Link href="/" className="inline-flex items-center">
            <span className="text-lg font-bold text-brand-dark">
              <span>If</span>
              <span className="hidden group-hover:inline">use</span>
              <span className="text-brand-dark/30">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center h-10 rounded-md overflow-hidden
                    ${
                      isActive(item.href)
                        ? "bg-brand-dark text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="min-w-[40px] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200">
          {/* User Profile */}
          <div className="mb-3 py-2">
            <div className="flex items-center">
              <div className="min-w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-gray-500 text-sm font-medium">AV</span>
                {/* Alternatively, use an image: <img src="/avatar.png" alt="User avatar" /> */}
              </div>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium text-gray-800">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center h-10 rounded-md overflow-hidden text-gray-600 hover:bg-gray-100"
          >
            <div className="min-w-[40px] flex items-center justify-center">
              <ExitIcon className="w-5 h-5" />
            </div>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideMenu;
