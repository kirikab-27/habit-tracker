'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from 'date-fns'
import { ja } from 'date-fns/locale'

interface CalendarViewProps {
  habits: any[]
}

export function CalendarView({ habits }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = getDay(monthStart)

  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    let completedCount = 0
    let totalCount = habits.length

    habits.forEach(habit => {
      const record = habit.records?.find((r: any) => r.date === dateStr)
      if (record && (record.status === 'completed' || record.status === 'partial')) {
        completedCount++
      }
    })

    if (totalCount === 0) return 'empty'
    const completionRate = completedCount / totalCount

    if (completionRate === 1) return 'perfect'
    if (completionRate >= 0.75) return 'good'
    if (completionRate >= 0.5) return 'moderate'
    if (completionRate > 0) return 'low'
    return 'none'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'bg-green-500 text-white'
      case 'good':
        return 'bg-green-400 text-white'
      case 'moderate':
        return 'bg-yellow-400 text-white'
      case 'low':
        return 'bg-orange-400 text-white'
      case 'none':
        return 'bg-gray-100'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            今月
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <div className="grid grid-cols-7 gap-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}

          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {daysInMonth.map((date) => {
            const status = getDayStatus(date)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'relative p-2 text-center rounded-md cursor-pointer transition-colors',
                  getStatusColor(status),
                  isToday && 'ring-2 ring-primary',
                  !isSameMonth(date, currentMonth) && 'text-muted-foreground'
                )}
              >
                <div className="text-sm font-medium">
                  {format(date, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-muted-foreground">完璧</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400" />
            <span className="text-sm text-muted-foreground">良好</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span className="text-sm text-muted-foreground">まあまあ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span className="text-sm text-muted-foreground">少し</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100" />
            <span className="text-sm text-muted-foreground">なし</span>
          </div>
        </div>
      </div>
    </div>
  )
}