'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HabitFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function HabitForm({ onSubmit, onCancel }: HabitFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trackingType: 'binary',
    targetValue: '',
    targetUnit: '',
    frequencyType: 'daily',
    reminderTime: '',
    color: '#3B82F6',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">習慣名 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例: 毎日運動する"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="例: 30分のウォーキングまたはジョギング"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trackingType">トラッキングタイプ</Label>
        <Select
          value={formData.trackingType}
          onValueChange={(value) =>
            setFormData({ ...formData, trackingType: value })
          }
        >
          <SelectTrigger id="trackingType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="binary">完了/未完了</SelectItem>
            <SelectItem value="count">カウント</SelectItem>
            <SelectItem value="time">時間</SelectItem>
            <SelectItem value="percentage">パーセンテージ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.trackingType !== 'binary' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetValue">目標値</Label>
            <Input
              id="targetValue"
              type="number"
              value={formData.targetValue}
              onChange={(e) =>
                setFormData({ ...formData, targetValue: e.target.value })
              }
              placeholder="例: 30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetUnit">単位</Label>
            <Input
              id="targetUnit"
              value={formData.targetUnit}
              onChange={(e) =>
                setFormData({ ...formData, targetUnit: e.target.value })
              }
              placeholder="例: 分"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="frequencyType">頻度</Label>
        <Select
          value={formData.frequencyType}
          onValueChange={(value) =>
            setFormData({ ...formData, frequencyType: value })
          }
        >
          <SelectTrigger id="frequencyType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">毎日</SelectItem>
            <SelectItem value="weekly">週単位</SelectItem>
            <SelectItem value="custom">カスタム</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminderTime">リマインダー時刻</Label>
        <Input
          id="reminderTime"
          type="time"
          value={formData.reminderTime}
          onChange={(e) =>
            setFormData({ ...formData, reminderTime: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">色</Label>
        <Input
          id="color"
          type="color"
          value={formData.color}
          onChange={(e) =>
            setFormData({ ...formData, color: e.target.value })
          }
          className="h-10 w-20"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">作成</Button>
      </div>
    </form>
  )
}