import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { habitId, date, status = 'completed', value, note } = body

    const existingRecord = await prisma.habitRecord.findUnique({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    })

    if (existingRecord) {
      const updatedRecord = await prisma.habitRecord.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          status: existingRecord.status === 'completed' ? 'missed' : 'completed',
          value,
          completionRate: existingRecord.status === 'completed' ? 0 : 1,
          note,
        },
      })

      await updateHabitScore(habitId)

      return NextResponse.json(updatedRecord)
    } else {
      const newRecord = await prisma.habitRecord.create({
        data: {
          habitId,
          date,
          status,
          value,
          completionRate: status === 'completed' ? 1 : 0,
          note,
        },
      })

      await updateHabitScore(habitId)

      return NextResponse.json(newRecord, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating checkin:', error)
    return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 })
  }
}

async function updateHabitScore(habitId: string) {
  try {
    const last30Days = await prisma.habitRecord.findMany({
      where: {
        habitId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const completedDays = last30Days.filter(r => r.status === 'completed' || r.status === 'partial').length
    const strengthScore = Math.min(100, (completedDays / 30) * 100)

    await prisma.habit.update({
      where: { id: habitId },
      data: { strengthScore },
    })

    await prisma.habitScore.create({
      data: {
        habitId,
        date: new Date().toISOString().split('T')[0],
        strengthScore,
        momentumScore: calculateMomentumScore(last30Days),
        consistencyScore: calculateConsistencyScore(last30Days),
      },
    })
  } catch (error) {
    console.error('Error updating habit score:', error)
  }
}

function calculateMomentumScore(records: any[]): number {
  if (records.length === 0) return 0

  const sortedRecords = records.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  let currentDate = new Date()

  for (const record of sortedRecords) {
    const recordDate = new Date(record.date)
    const dayDiff = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff <= 1 && (record.status === 'completed' || record.status === 'partial')) {
      streak++
      currentDate = recordDate
    } else {
      break
    }
  }

  return Math.min(100, streak * 10)
}

function calculateConsistencyScore(records: any[]): number {
  if (records.length === 0) return 0

  const weeklyCompletion: { [key: string]: number[] } = {}

  records.forEach(record => {
    const date = new Date(record.date)
    const weekNumber = getWeekNumber(date)
    const year = date.getFullYear()
    const key = `${year}-${weekNumber}`

    if (!weeklyCompletion[key]) {
      weeklyCompletion[key] = []
    }

    if (record.status === 'completed' || record.status === 'partial') {
      weeklyCompletion[key].push(1)
    } else {
      weeklyCompletion[key].push(0)
    }
  })

  const weeklyScores = Object.values(weeklyCompletion).map(week =>
    week.reduce((sum, val) => sum + val, 0) / week.length
  )

  const averageScore = weeklyScores.reduce((sum, score) => sum + score, 0) / weeklyScores.length

  return Math.min(100, averageScore * 100)
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}