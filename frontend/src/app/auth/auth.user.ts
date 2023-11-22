export interface AuthUser {
  id: number
  username: string
  role: 'super_admin' | 'admin' | 'service_provider' | 'consumer'
}
