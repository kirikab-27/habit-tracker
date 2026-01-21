import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      where: {
        archived: false,
      },
      include: {
        records: {
          where: {
            date: new Date().toISOString().split('T')[0],
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const habit = await prisma.habit.create({
      data: {
        name: body.name,
        description: body.description,
        trackingType: body.trackingType || 'binary',
        targetValue: body.targetValue,
        targetUnit: body.targetUnit,
        frequencyType: body.frequencyType || 'daily',
        frequencyDays: body.frequencyDays ? JSON.stringify(body.frequencyDays) : null,
        color: body.color,
        icon: body.icon,
        reminderTime: body.reminderTime,
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}