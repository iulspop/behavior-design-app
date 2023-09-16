import type { RecurringQuestion } from '~/self-data-collection/domain/entities/recurring-question'

export type PromptCardComponentProps = {
  question: RecurringQuestion
}

export function QuestionCardComponent({ question }: PromptCardComponentProps) {
  return (
    <li className="bg-white shadow-md rounded-md p-4 m-2 hover:bg-gray-100 text dark:text-black">
      <p className="text-lg font-semibold">{question.question}</p>
    </li>
  )
}
