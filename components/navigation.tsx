// This component is now deprecated in favor of BottomNavigation
// Keeping for backward compatibility but should be removed eventually

import { Search, Home, User, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navigation() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/create">
              <h2 className="text-xl font-bold text-foreground">SongDash</h2>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
