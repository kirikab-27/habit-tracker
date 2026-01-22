'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const WORK_TIME = 25 * 60 // 25 minutes in seconds
const SHORT_BREAK = 5 * 60 // 5 minutes in seconds
const LONG_BREAK = 15 * 60 // 15 minutes in seconds

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export function PomodoroTimer() {
  const [time, setTime] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio element for notification sound
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 0.5

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err)
        })
      }
    } catch (error) {
      console.log('Error playing notification:', error)
    }
  }, [])

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    playNotificationSound()

    if (mode === 'work') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)

      // After 4 pomodoros, suggest a long break
      if (newCount % 4 === 0) {
        setMode('longBreak')
        setTime(LONG_BREAK)
      } else {
        setMode('shortBreak')
        setTime(SHORT_BREAK)
      }
    } else {
      // After a break, go back to work
      setMode('work')
      setTime(WORK_TIME)
    }

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'work'
        ? '作業時間が終了しました！休憩しましょう。'
        : '休憩が終了しました！作業を再開しましょう。'

      try {
        new Notification('ポモドーロタイマー', {
          body: message,
          icon: '/icon.png'
        })
      } catch (error) {
        console.log('Notification failed:', error)
      }
    }
  }, [mode, completedPomodoros, playNotificationSound])

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 1
          if (newTime <= 0) {
            handleTimerComplete()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Handle timer reaching 0
      if (time === 0 && isRunning) {
        handleTimerComplete()
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, time, handleTimerComplete])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    switch (mode) {
      case 'work':
        setTime(WORK_TIME)
        break
      case 'shortBreak':
        setTime(SHORT_BREAK)
        break
      case 'longBreak':
        setTime(LONG_BREAK)
        break
    }
  }

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setMode(newMode)

    switch (newMode) {
      case 'work':
        setTime(WORK_TIME)
        break
      case 'shortBreak':
        setTime(SHORT_BREAK)
        break
      case 'longBreak':
        setTime(LONG_BREAK)
        break
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const total = mode === 'work' ? WORK_TIME : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK
    return ((total - time) / total) * 100
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ポモドーロタイマー</span>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            <span>{completedPomodoros} 完了</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          <Button
            variant={mode === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('work')}
          >
            作業
          </Button>
          <Button
            variant={mode === 'shortBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('shortBreak')}
          >
            <Coffee className="h-4 w-4 mr-1" />
            短休憩
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('longBreak')}
          >
            <Coffee className="h-4 w-4 mr-1" />
            長休憩
          </Button>
        </div>

        <div className="relative">
          <div className="text-6xl font-bold text-center tabular-nums">
            {formatTime(time)}
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-linear",
                mode === 'work' ? 'bg-red-500' : 'bg-green-500'
              )}
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className={cn(
              "min-w-[120px]",
              isRunning && "bg-orange-500 hover:bg-orange-600"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                一時停止
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                開始
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={resetTimer}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            リセット
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {mode === 'work' && '集中して作業しましょう！'}
          {mode === 'shortBreak' && '少し休憩して、リフレッシュしましょう。'}
          {mode === 'longBreak' && 'しっかり休憩を取りましょう。'}
        </div>
      </CardContent>
    </Card>
  )
}