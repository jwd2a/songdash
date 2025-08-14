"use client"

import { Navigation } from "@/components/navigation"
import { MusicSearch } from "@/components/music-search"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Search Music</h1>
            <p className="text-lg text-muted-foreground">Find songs to create your next lyric moment</p>
          </div>
          <MusicSearch />
        </div>
      </main>
    </div>
  )
}
