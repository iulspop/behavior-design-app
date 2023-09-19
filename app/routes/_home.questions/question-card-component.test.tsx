import { createRemixStub } from '@remix-run/testing/dist/create-remix-stub'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import type { RecurringQuestion } from '~/self-data-collection/domain/entities/recurring-question'
import { QuestionCardComponent } from './question-card-component'

describe('QuestionCardComponent()', () => {
  test('given a recurring question: render question text inside list item and link to question', async () => {
    const recurringQuestion: RecurringQuestion = {
      userId: '1',
      id: '1',
      order: 1,
      text: 'Did you go to bed between 8 and 9PM?',

      timestamp: new Date(),
      utcOffsetInMinutes: -300,
    }

    const RemixStub = createRemixStub([
      {
        path: '/',
        element: <QuestionCardComponent {...recurringQuestion} />,
      },
    ])
    render(<RemixStub />)

    const listItem = screen.getByRole('listitem')
    const questionText = within(listItem).getByText(recurringQuestion.text)

    expect(questionText).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', `/questions/${recurringQuestion.id}`)
  })
})
