'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Dashboard() {
  const router = useRouter()
  const { token, user, logout } = useAuthStore()

  useEffect(() => {
    // Login bypassed
    // if (!token) {
    //  router.push('/auth/login')
    // }
  }, [token, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // if (!token) {
  //  return null
  // }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Aurora Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-[100%] bg-blue-600/10 blur-[150px]" />
      </div>

      <header className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-background/80 to-transparent border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 cursor-pointer" onClick={() => router.push('/')}>
            Zhovon AI Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10 max-w-5xl">
        <h2 className="text-3xl font-bold mb-8">Welcome back, {user?.username || 'Creator'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card flex flex-col items-start justify-between rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-colors">
            <div>
              <h2 className="text-xl font-bold mb-2">Create New Content</h2>
              <p className="text-muted-foreground text-sm mb-6">Start generating mind-blowing AI images and videos with our latest advanced models like Wan 2.1 and Kling 3.0.</p>
            </div>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              Open Studio
            </Link>
          </div>

          <div className="glass-card flex flex-col items-start justify-between rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-colors">
            <div>
              <h2 className="text-xl font-bold mb-2">Account Settings</h2>
              <p className="text-muted-foreground text-sm mb-6">Manage your profile, update your API credentials, or upgrade your pricing plan to unlock unlimited logic.</p>
            </div>
            <Link
              href="/settings"
              className="inline-block px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              Manage Settings
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
