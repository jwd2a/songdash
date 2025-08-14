import { MusicSearch } from "@/components/music-search"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">LyricLoop</h1>
            <p className="text-lg text-muted-foreground">
              Your soundtrack is waiting — highlight a lyric that feels like today.
            </p>
          </div>
          <MusicSearch />
        </div>
      </main>
    </div>
  )
}
