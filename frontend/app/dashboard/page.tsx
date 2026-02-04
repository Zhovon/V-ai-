'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Dashboard() {
  const router = useRouter()
  const { token, user, logout } = useAuthStore()

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
    }
  }, [token, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!token) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">VideoSaaS Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Create Video</h2>
            <Link
              href="/dashboard/videos/create"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              New Video
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Your Videos</h2>
            <Link
              href="/dashboard/videos"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              View Videos
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
