"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  // Redirect to create page by default
  useEffect(() => {
    router.push('/create')
  }, [router])

  // Don't render anything while redirecting
  return null
}
