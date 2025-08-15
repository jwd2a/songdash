"use client"

import { Home, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavigation() {
  const pathname = usePathname()

  const tabs = [
    {
      id: "feed",
      label: "Feed",
      icon: Home,
      href: "/feed",
      isActive: pathname === "/feed"
    },
    {
      id: "share",
      label: "Share",
      icon: Upload,
      href: "/create",
      isActive: pathname === "/create" || pathname.startsWith("/song/")
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
      isActive: pathname === "/profile"
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link key={tab.id} href={tab.href} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full flex flex-col items-center gap-1 py-2 px-1 h-auto min-h-[44px] touch-manipulation ${
                  tab.isActive 
                    ? "text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label={tab.label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}