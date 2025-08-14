"use client"

import { BottomNavigation } from "@/components/bottom-navigation"
import { SocialFeed } from "@/components/social-feed"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-center">🎵 SongDash</h1>
      </div>

      {/* Feed */}
      <div className="p-4">
        <SocialFeed />
      </div>

      <BottomNavigation />
    </div>
  )
}
