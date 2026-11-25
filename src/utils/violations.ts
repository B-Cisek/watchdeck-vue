import { isAxiosError } from 'axios'

interface Violation {
  propertyPath: string
  title: string
}

/** Validation errors from the API (422) for the given form fields; empty for any other error. */
export function fieldErrors<F extends string>(
  error: unknown,
  fields: readonly F[],
): { name: F; message: string }[] {
  if (
    !isAxiosError<{ violations?: Violation[] } | undefined>(error) ||
    error.response?.status !== 422
  ) {
    return []
  }

  return (error.response.data?.violations ?? []).flatMap(({ propertyPath, title }) => {
    const name = fields.find((field) => field === propertyPath)
    return name ? [{ name, message: title }] : []
  })
}
