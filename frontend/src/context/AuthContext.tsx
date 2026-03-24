import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, otp: string, fullName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const HARDCODED_OTP = '010494'

function mapSupabaseUser(supaUser: { id: string; email?: string; user_metadata?: Record<string, string> }): User {
  const role: 'seller' | 'approver' = supaUser.email?.includes('tgt.com') ? 'approver' : 'seller'
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    role,
    name: supaUser.user_metadata?.full_name,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      }
      setLoading(false)
    })

    // Keep user in sync with Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, otp: string, fullName?: string) => {
    if (otp !== HARDCODED_OTP) {
      throw new Error('Invalid OTP. Please try again.')
    }

    // Try signing in with email + hardcoded OTP as password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: HARDCODED_OTP,
    })

    if (!signInError) return

    // User doesn't exist yet — create the account (sign-up)
    if (signInError.message.toLowerCase().includes('invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: HARDCODED_OTP,
        options: {
          data: { full_name: fullName ?? '' },
        },
      })
      if (signUpError) throw signUpError

      // Sign in after account creation
      const { data: signInData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password: HARDCODED_OTP,
      })
      if (retryError) throw retryError

      // Create the initial seller lead row so journey-tracking queries never miss a row
      const userId = signInData?.user?.id ?? signUpData?.user?.id
      if (userId) {
        await supabase.from('seller_leads').insert({
          seller: userId,
          admin_name: fullName ?? '',
          journey_step: 'onboarding',
        })
      }
    } else {
      throw signInError
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
