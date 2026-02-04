export interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_active: boolean
  is_admin: boolean
}

export interface Video {
  id: number
  user_id: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  video_url: string | null
  thumbnail_url: string | null
  duration: number | null
  file_size: number | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}
