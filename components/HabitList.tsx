'use client'

import { useState } from 'react'
import { Check, X, SkipForward, Target, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Habit {
  id: string
  name: string
  description?: string
  trackingType: string
  targetValue?: number
  targetUnit?: string
  strengthScore: number
  records: any[]
}

interface HabitListProps {
  habits: Habit[]
  onToggle: (habitId: string, date: string) => void
  onDelete?: (habitId: string) => void
}

export function HabitList({ habits, onToggle, onDelete }: HabitListProps) {
  const today = new Date().toISOString().split('T')[0]
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  const getHabitStatus = (habit: Habit) => {
    const todayRecord = habit.records.find((r) => r.date === today)
    return todayRecord?.status || 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'partial':
        return 'bg-yellow-500'
      case 'skipped':
        return 'bg-gray-400'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    if (score >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (habitToDelete && onDelete) {
      onDelete(habitToDelete.id)
      setDeleteConfirmOpen(false)
      setHabitToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const status = getHabitStatus(habit)
        const isCompleted = status === 'completed'

        return (
          <div
            key={habit.id}
            className={cn(
              'p-4 rounded-lg border bg-card transition-all',
              isCompleted && 'bg-green-50 border-green-200'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggle(habit.id, today)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {isCompleted && <Check className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">習慣強度:</span>
                    <span
                      className={cn(
                        'font-semibold',
                        getStrengthColor(habit.strengthScore)
                      )}
                    >
                      {Math.round(habit.strengthScore)}%
                    </span>
                  </div>

                  {habit.targetValue && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        目標: {habit.targetValue} {habit.targetUnit}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <Progress value={habit.strengthScore} className="h-2" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log('Skip', habit.id)}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(habit)}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {habits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            まだ習慣が登録されていません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            「習慣を追加」ボタンから新しい習慣を作成しましょう
          </p>
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>習慣を削除しますか？</DialogTitle>
            <DialogDescription>
              「{habitToDelete?.name}」を削除します。この操作は取り消せません。
              関連するすべての記録も削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}