'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

type AuthMode = 'sign-in' | 'create-account' | 'reset-password'

export default function LoginPage() {
  const { login, registerAccount } = useApp()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('pamodziRememberedEmail')
    if (rememberedEmail) setEmail(rememberedEmail)
  }, [])

  const title = mode === 'create-account' ? 'Create account' : mode === 'reset-password' ? 'Reset password' : 'Sign in'
  const intro = mode === 'create-account'
    ? 'Create your landlord workspace with a few account details.'
    : mode === 'reset-password'
      ? 'Enter your email and we will prepare reset instructions for this demo account.'
      : 'Access your portfolio, rent updates, and tenant requests.'

  const canSubmit = useMemo(() => {
    if (loading) return false
    if (mode === 'reset-password') return email.trim().length > 3
    if (mode === 'create-account') {
      return (
        name.trim().length > 1 &&
        company.trim().length > 1 &&
        phone.trim().length > 5 &&
        email.trim().length > 3 &&
        password.length >= 8 &&
        confirmPassword.length >= 8 &&
        termsAccepted
      )
    }
    return email.trim().length > 3 && password.length >= 6
  }, [company, confirmPassword, email, loading, mode, name, password, phone, termsAccepted])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
    setShowPassword(false)

    if (nextMode === 'sign-in') {
      setPassword('')
      setConfirmPassword('')
      return
    }

    if (nextMode === 'create-account') {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      return
    }

    setPassword('')
    setConfirmPassword('')
  }


  function rememberEmailAddress(value: string) {
    if (rememberMe) {
      localStorage.setItem('pamodziRememberedEmail', value.trim())
      return
    }

    localStorage.removeItem('pamodziRememberedEmail')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!email.trim()) {
      setError('Enter your email address to continue.')
      return
    }

    if (mode === 'reset-password') {
      setLoading(true)
      await new Promise(r => setTimeout(r, 700))
      setLoading(false)
      setNotice(`Password reset instructions are ready for ${email.trim()}. If you don't have an account, you can create one.`)
      return
    }

    if (mode === 'create-account') {
      if (!name.trim() || !company.trim() || !phone.trim()) {
        setError('Complete your name, company, and phone number.')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      if (!termsAccepted) {
        setError('Accept the account terms to continue.')
        return
      }

      setLoading(true)
      const result = await registerAccount({
        name: name.trim(),
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      })
      setLoading(false)

      if (!result.ok) {
        setError(result.message)
        return
      }

      rememberEmailAddress(email)
      router.replace('/dashboard')
      return
    }

    if (!password) {
      setError('Enter your password to continue.')
      return
    }

    setLoading(true)
    const ok = await login(email.trim(), password)
    setLoading(false)

    if (ok) {
      rememberEmailAddress(email)
      router.replace('/dashboard')
      return
    }

    setError('Invalid email or password. Check the demo credentials and try again.')
  }

  return (
    <main className="flex h-screen items-center justify-center overflow-y-auto bg-[#F6F3EE] px-4 py-8 text-primary-c sm:px-6">
      <section className="w-full max-w-[460px] rounded-2xl border border-white bg-white px-5 py-7 shadow-xl sm:px-8">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="mt-4 text-2xl font-black tracking-normal text-[#1E2A2A]">PAMODZI</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8F9A8E]">Landlord Portal</p>
          <h1 className="mt-7 text-2xl font-black tracking-normal text-[#1E2A2A]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A6B5E]">{intro}</p>
        </div>

        {(error || notice) && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              error
                ? 'border-[#C35D3A]/25 bg-[#C35D3A]/10 text-[#9D3E22] animate-shake'
                : 'border-[#2D6A4F]/20 bg-[#2D6A4F]/10 text-[#1F4D38]'
            }`}
            role={error ? 'alert' : 'status'}
          >
            {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{error || notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'create-account' && (
            <>
              <TextField id="name" label="Full name" value={name} onChange={setName} placeholder="James Mwale" icon={<UserRound className="h-4 w-4" />} autoComplete="name" />
              <TextField id="company" label="Company" value={company} onChange={setCompany} placeholder="Mwale Properties Ltd" icon={<BriefcaseBusiness className="h-4 w-4" />} autoComplete="organization" />
              <TextField id="phone" label="Phone number" value={phone} onChange={setPhone} placeholder="+260 977 123456" icon={<Phone className="h-4 w-4" />} autoComplete="tel" />
            </>
          )}

          <TextField id="email" label="Email address" value={email} onChange={setEmail} placeholder="name@company.com" icon={<Mail className="h-4 w-4" />} type="email" autoComplete="email" />

          {mode !== 'reset-password' && (
            <>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(value => !value)}
                placeholder={mode === 'create-account' ? 'Create a password' : 'Enter your password'}
              />

              {mode === 'create-account' && (
                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(value => !value)}
                  placeholder="Repeat your password"
                />
              )}
            </>
          )}

          {mode === 'sign-in' && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[#5A6B5E]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D1C9B8] accent-[#2D6A4F]"
                />
                Keep me signed in
              </label>
              <button type="button" onClick={() => switchMode('reset-password')} className="text-xs font-bold text-[#2D6A4F] transition hover:text-[#1F4D38]">
                Forgot password?
              </button>
            </div>
          )}

          {mode === 'create-account' && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5DFD3] bg-[#FBFAF7] p-3 text-xs leading-5 text-[#5A6B5E]">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1C9B8] accent-[#2D6A4F]"
              />
              I agree to use Pamodzi for authorised property management activity and understand this demo account is stored locally in this browser.
            </label>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 text-sm font-black text-white shadow-md shadow-[#2D6A4F]/25 transition hover:bg-[#1F4D38] hover:shadow-lg hover:shadow-[#2D6A4F]/25 focus:outline-none focus:ring-4 focus:ring-[#2D6A4F]/20 disabled:cursor-not-allowed disabled:bg-[#AAB5AA] disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === 'create-account' ? 'Creating account' : mode === 'reset-password' ? 'Preparing reset' : 'Signing in'}
              </>
            ) : (
              <>
                {mode === 'create-account' ? <UserPlus className="h-4 w-4" /> : mode === 'reset-password' ? <KeyRound className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                {mode === 'create-account' ? 'Create account' : mode === 'reset-password' ? 'Send reset instructions' : 'Sign in'}
              </>
            )}
          </button>
        </form>

        {/* Demo credentials removed */}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[#5A6B5E]">
          {mode !== 'sign-in' ? (
            <button type="button" onClick={() => switchMode('sign-in')} className="font-bold text-[#2D6A4F] hover:text-[#1F4D38]">Back to sign in</button>
          ) : (
            <>
              <span>Need an account?</span>
              <button type="button" onClick={() => switchMode('create-account')} className="font-bold text-[#2D6A4F] hover:text-[#1F4D38]">Create one</button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: React.ReactNode
  type?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#5A6B5E]">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8F9A8E] transition-colors group-focus-within:text-[#2D6A4F]">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="h-12 w-full rounded-xl border border-[#E5DFD3] bg-[#FBFAF7] pl-11 pr-4 text-sm text-[#1E2A2A] outline-none transition placeholder:text-[#8F9A8E] focus:border-[#2D6A4F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)]"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  placeholder: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#5A6B5E]">
        {label}
      </label>
      <div className="group relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F9A8E] transition-colors group-focus-within:text-[#2D6A4F]" />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={id === 'password' ? 'current-password' : 'new-password'}
          required
          minLength={8}
          className="h-12 w-full rounded-xl border border-[#E5DFD3] bg-[#FBFAF7] pl-11 pr-12 text-sm text-[#1E2A2A] outline-none transition placeholder:text-[#8F9A8E] focus:border-[#2D6A4F] focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,106,79,0.12)]"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8F9A8E] transition hover:bg-[#F0EDE6] hover:text-[#1E2A2A] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
