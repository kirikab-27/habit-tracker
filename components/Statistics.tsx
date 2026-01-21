'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Award, Target, Calendar } from 'lucide-react'

interface StatisticsProps {
  habits: any[]
}

export function Statistics({ habits }: StatisticsProps) {
  const calculateOverallStats = () => {
    if (habits.length === 0) return {
      averageStrength: 0,
      totalHabits: 0,
      activeHabits: 0,
      completionRate: 0
    }

    const totalStrength = habits.reduce((sum, habit) => sum + (habit.strengthScore || 0), 0)
    const averageStrength = totalStrength / habits.length

    const today = new Date().toISOString().split('T')[0]
    let completedToday = 0
    habits.forEach(habit => {
      const todayRecord = habit.records?.find((r: any) => r.date === today)
      if (todayRecord && (todayRecord.status === 'completed' || todayRecord.status === 'partial')) {
        completedToday++
      }
    })

    const completionRate = habits.length > 0 ? (completedToday / habits.length) * 100 : 0

    return {
      averageStrength: Math.round(averageStrength),
      totalHabits: habits.length,
      activeHabits: habits.filter((h: any) => !h.archived).length,
      completionRate: Math.round(completionRate)
    }
  }

  const stats = calculateOverallStats()

  const topHabits = [...habits]
    .sort((a, b) => (b.strengthScore || 0) - (a.strengthScore || 0))
    .slice(0, 3)

  const strugglingHabits = [...habits]
    .sort((a, b) => (a.strengthScore || 0) - (b.strengthScore || 0))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均習慣強度</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageStrength}%</div>
            <Progress value={stats.averageStrength} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総習慣数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHabits}</div>
            <p className="text-xs text-muted-foreground">
              アクティブ: {stats.activeHabits}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の達成率</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続記録</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0日</div>
            <p className="text-xs text-muted-foreground">
              最長: 0日
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>トップ習慣</CardTitle>
            <CardDescription>最も強度が高い習慣</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHabits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{habit.name}</p>
                    <Progress value={habit.strengthScore || 0} className="mt-1 h-2" />
                  </div>
                  <span className="ml-4 text-sm font-semibold">
                    {Math.round(habit.strengthScore || 0)}%
                  </span>
                </div>
              ))}
              {topHabits.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  データがありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>改善が必要な習慣</CardTitle>
            <CardDescription>強度が低い習慣</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strugglingHabits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{habit.name}</p>
                    <Progress value={habit.strengthScore || 0} className="mt-1 h-2" />
                  </div>
                  <span className="ml-4 text-sm font-semibold">
                    {Math.round(habit.strengthScore || 0)}%
                  </span>
                </div>
              ))}
              {strugglingHabits.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  データがありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}