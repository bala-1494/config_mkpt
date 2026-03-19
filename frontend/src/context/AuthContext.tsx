import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import pb from '../lib/pocketbase'
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
    // Restore session from PocketBase store (it persists to localStorage automatically)
    if (pb.authStore.isValid && pb.authStore.model) {
      const model = pb.authStore.model as Record<string, string>
      setUser({
        id: model.id,
        email: model.email,
        role: model.role as 'seller' | 'approver',
      })
    }
    setLoading(false)

    const unsub = pb.authStore.onChange((_token, model) => {
      if (model) {
        setUser({
          id: (model as Record<string, string>).id,
          email: (model as Record<string, string>).email,
          role: (model as Record<string, string>).role as 'seller' | 'approver',
        })
      } else {
        setUser(null)
      }
    })
    return () => unsub()
  }, [])

  const login = async (email: string, otp: string) => {
    if (otp !== HARDCODED_OTP) {
      throw new Error('Invalid OTP. Please try again.')
    }
    const authData = await pb.collection('users').authWithPassword(email, otp)
    const model = authData.record as unknown as Record<string, string>
    setUser({
      id: model.id,
      email: model.email,
      role: model.role as 'seller' | 'approver',
    })
  }

  const logout = () => {
    pb.authStore.clear()
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
