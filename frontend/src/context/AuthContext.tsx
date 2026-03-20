import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, otp: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const HARDCODED_OTP = '010494'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata as Record<string, string>
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          role: (meta?.role ?? 'seller') as 'seller' | 'approver',
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata as Record<string, string>
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          role: (meta?.role ?? 'seller') as 'seller' | 'approver',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, otp: string) => {
    if (otp !== HARDCODED_OTP) {
      throw new Error('Invalid OTP. Please try again.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: otp })
    if (error) throw new Error(error.message)
    if (data.user) {
      const meta = data.user.user_metadata as Record<string, string>
      setUser({
        id: data.user.id,
        email: data.user.email ?? '',
        role: (meta?.role ?? 'seller') as 'seller' | 'approver',
      })
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
