import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cp = searchParams.get('cp')

  if (!cp || cp.length < 4 || cp.length > 5) {
    return NextResponse.json({ communes: [] }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom,codesPostaux,departement,region`,
      { next: { revalidate: 86400 } } // cache 24h
    )

    if (!res.ok) {
      return NextResponse.json({ communes: [] })
    }

    const data = await res.json()
    const communes = data.map((c: { nom: string; departement?: { nom: string; code: string }; region?: { nom: string } }) => ({
      nom: c.nom,
      departement: c.departement?.nom || '',
      departementCode: c.departement?.code || '',
      region: c.region?.nom || '',
    }))

    return NextResponse.json({ communes })
  } catch {
    return NextResponse.json({ communes: [] })
  }
}
