import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">VideoSaaS</h1>
          <p className="text-xl text-blue-100 mb-12">
            Professional video generation platform
          </p>
          
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-900 transition"
            >
              Register
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
              <h3 className="text-white text-xl font-bold mb-2">Fast</h3>
              <p className="text-blue-100">Generate videos in seconds</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
              <h3 className="text-white text-xl font-bold mb-2">Easy</h3>
              <p className="text-blue-100">Intuitive interface for everyone</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
              <h3 className="text-white text-xl font-bold mb-2">Reliable</h3>
              <p className="text-blue-100">Enterprise-grade infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
