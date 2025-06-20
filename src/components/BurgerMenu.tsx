"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Menu,
  X,
  Pin,
  User,
  FileText,
  Home,
  Plus,
  Github,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { href: "/feed", label: "Feed", icon: FileText },
    { href: "/community", label: "Edge Esmeralda", icon: FileText },
    { href: "/form/create", label: "Create Prompt", icon: Plus },
    { href: "/pinned", label: "Pinned", icon: Pin },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const socialItems = [
    { href: "/tiktok", label: "TikTok", icon: FileText },
    { href: "/github", label: "GitHub", icon: Github },
    { href: "/twitter", label: "Twitter", icon: Twitter },
  ];

  return (
    <div className="relative">
      {/* Burger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-white p-2"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/pinned" && pathname.startsWith("/pinned")) ||
                (item.href === "/form/create" &&
                  pathname.startsWith("/form/create")) ||
                (item.href === "/prompt" && pathname.startsWith("/prompt"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-700 my-2"></div>

            {/* Social Media Links */}
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 font-medium mb-2">
                Social
              </div>
              {socialItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
