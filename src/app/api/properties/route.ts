export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const propertyType = searchParams.get('propertyType')
    const priceType = searchParams.get('priceType')
    const bedrooms = searchParams.get('bedrooms')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {
      status: 'ACTIVE',
    }

    if (city) {
      where.city = city
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    if (priceType) {
      where.priceType = priceType
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: true,
          owner: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires peuvent publier une annonce' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      title,
      description,
      address,
      city,
      price,
      priceType,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      ownershipDocument,
      latitude,
      longitude,
      images,
    } = body

    if (!title || !description || !address || !city || !price || !priceType || !bedrooms || !bathrooms || !propertyType) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        price: parseFloat(price),
        priceType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: area ? parseFloat(area) : null,
        propertyType,
        ownershipDocument: ownershipDocument || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ownerId: userId,
        images: images?.length
          ? {
              create: images.map((url: string) => ({ url })),
            }
          : undefined,
      },
      include: {
        images: true,
        owner: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(
      { message: 'Propriété créée avec succès', property },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la propriété:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
