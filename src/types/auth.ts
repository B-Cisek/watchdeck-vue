export interface User {
  id: string
  email: string
  roles: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}
