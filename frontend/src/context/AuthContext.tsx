import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, otp: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const HARDCODED_OTP = '010494'
const MOCK_USER_KEY = 'mock_seller_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore mock user from localStorage
    const stored = localStorage.getItem(MOCK_USER_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User)
      } catch {
        localStorage.removeItem(MOCK_USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, otp: string) => {
    if (otp !== HARDCODED_OTP) {
      throw new Error('Invalid OTP. Please try again.')
    }
    // Determine role based on email domain
    const role: 'seller' | 'approver' = email.includes('tgt.com') ? 'approver' : 'seller'
    const mockUser: User = {
      id: `mock-${email}`,
      email,
      role,
    }
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser))
    setUser(mockUser)
  }

  const logout = () => {
    localStorage.removeItem(MOCK_USER_KEY)
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
