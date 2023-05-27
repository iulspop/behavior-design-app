import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserIsAuthenticated } from '~/routes/_auth/user-authentication-session.server'
import { QuestionListComponent } from '~/routes/_home.questions/question-list-component'
import type { RecurringQuestion } from '~/self-data-collection/domain/entities/recurring-question'
import { RecurringQuestions } from '~/self-data-collection/domain/index.server'
import { CreateQuestionFormComponent } from './create-question-form-component'

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserIsAuthenticated(request)
  const recurringQuestions = await RecurringQuestions.readAll(userId)
  return json(recurringQuestions)
}

export const meta: V2_MetaFunction<typeof loader> = () => [{ title: 'Questions | Inquire' }]

export default function CreateQuestionPage() {
  const recurringQuestions = useLoaderData<typeof loader>().map(serializedRecurringQuestion => ({
    ...serializedRecurringQuestion,
    phase: {
      timestamp: new Date(serializedRecurringQuestion.phase.timestamp),
      utcOffsetInMinutes: serializedRecurringQuestion.phase.utcOffsetInMinutes,
    },
  })) as RecurringQuestion[]

  return (
    <>
      <CreateQuestionFormComponent />
      <QuestionListComponent questions={recurringQuestions} />
    </>
  )
}
