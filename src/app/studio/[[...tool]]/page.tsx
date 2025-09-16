import StudioWrapper from '@/components/StudioWrapper'

export const runtime = 'nodejs'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <StudioWrapper />
}
