'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import apiClient from '@/lib/api'
import { Video } from '@/lib/types'

export default function VideosPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchVideos = async () => {
      try {
        const data = await apiClient.get(`/api/v1/videos?token=${token}`)
        setVideos(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [token, router])

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Videos</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-500">No videos yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">No thumbnail</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{video.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      video.status === 'completed' ? 'bg-green-100 text-green-800' :
                      video.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      video.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {video.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
