import { redirect } from 'next/navigation'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  redirect(`/${locale}/dashboard/projects/${id}/overview`)
}
