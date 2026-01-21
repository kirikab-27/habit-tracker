'use client'

import { useState, useEffect } from 'react'
import { HabitList } from '@/components/HabitList'
import { HabitForm } from '@/components/HabitForm'
import { CalendarView } from '@/components/CalendarView'
import { Statistics } from '@/components/Statistics'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Home() {
  const [habits, setHabits] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Failed to load habits:', error)
    }
  }

  const handleCreateHabit = async (habitData: any) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      })
      if (response.ok) {
        setShowForm(false)
        loadHabits()
      }
    } catch (error) {
      console.error('Failed to create habit:', error)
    }
  }

  const handleToggleHabit = async (habitId: string, date: string) => {
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habitId, date }),
      })
      if (response.ok) {
        loadHabits()
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        loadHabits()
      }
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">習慣トラッカー</h1>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> 習慣を追加
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">今日</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
            <TabsTrigger value="stats">統計</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">今日の習慣</h2>
                <HabitList habits={habits} onToggle={handleToggleHabit} onDelete={handleDeleteHabit} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarView habits={habits} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <Statistics habits={habits} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい習慣を作成</DialogTitle>
            <DialogDescription>
              追跡したい習慣の詳細を入力してください
            </DialogDescription>
          </DialogHeader>
          <HabitForm onSubmit={handleCreateHabit} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}