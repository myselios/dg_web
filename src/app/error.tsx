'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-6">
          예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            다시 시도
          </Button>
          <Button
            variant="secondary"
            onClick={() => { window.location.href = '/' }}
          >
            목록으로
          </Button>
        </div>
      </div>
    </div>
  )
}
