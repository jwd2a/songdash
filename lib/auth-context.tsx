"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For development, automatically sign in as the demo user
    const demoUser: AuthUser = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'You',
      username: '@you',
      email: 'you@example.com',
      avatar: '/placeholder.svg'
    }
    
    setUser(demoUser)
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // TODO: Implement real authentication
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const demoUser: AuthUser = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'You',
      username: '@you',
      email: email,
      avatar: '/placeholder.svg'
    }
    
    setUser(demoUser)
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}