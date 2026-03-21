import { getQuestionById, getAdjacentIds } from '@/lib/questions'
import { notFound } from 'next/navigation'
import { QuizLayout } from '@/components/QuizLayout'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params
  const question = getQuestionById(id)
  if (!question) notFound()

  const { prevId, nextId } = getAdjacentIds(id)

  return <QuizLayout question={question} prevId={prevId} nextId={nextId} />
}
