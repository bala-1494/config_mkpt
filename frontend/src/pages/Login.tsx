import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Step = 'email' | 'otp'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setStep('otp')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, otp)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
            style={{ backgroundColor: '#CC0000' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Seller Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Onboarding &amp; Management</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {step === 'email' ? (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Sign in to your account</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email to receive a one-time passcode</p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ '--tw-ring-color': '#CC0000' } as React.CSSProperties}
                    onFocus={(e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.15)' }}
                    onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  Send OTP
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h2 className="text-lg font-medium text-gray-900 mb-1">Check your email</h2>
              <p className="text-sm text-gray-500 mb-1">
                We've sent a one-time passcode to
              </p>
              <p className="text-sm font-medium text-gray-800 mb-6">{email}</p>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">One-time passcode</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm tracking-widest focus:outline-none transition"
                    onFocus={(e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.15)' }}
                    onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
