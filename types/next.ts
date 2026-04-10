// Helper type for Next.js 16 async page props
export type PageProps<T extends string = string> = {
  params: Promise<Record<string, string>>
  searchParams?: Promise<Record<string, string | string[]>>
}
