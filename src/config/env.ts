function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

export const config = Object.freeze({
  apiUrl: required('VITE_API_URL'),
  appEnv: required('VITE_APP_ENV'),
})
