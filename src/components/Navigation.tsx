import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Props {
  prevId: string | null
  nextId: string | null
}

export function Navigation({ prevId, nextId }: Props) {
  return (
    <div className="flex justify-between mt-6">
      {prevId ? (
        <Link href={`/quiz/${prevId}`}>
          <Button variant="secondary" size="md">
            ← 이전
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="md" disabled>
          ← 이전
        </Button>
      )}

      {nextId ? (
        <Link href={`/quiz/${nextId}`}>
          <Button variant="secondary" size="md">
            다음 →
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="md" disabled>
          다음 →
        </Button>
      )}
    </div>
  )
}
