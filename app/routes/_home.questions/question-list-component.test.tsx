import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import type { RecurringQuestion } from '~/self-data-collection/domain/entities/recurring-question'
import { QuestionListComponent } from './question-list-component'

describe('QuestionList component', () => {
  test('given a sorted list of recurring questions: render the list of questions in the order given', async () => {
    const recurringQuestions: RecurringQuestion[] = [
      {
        id: '1',
        userId: '1',
        order: 1,
        question: 'Did you go to bed between 8 and 9PM?',
        phase: {
          timestamp: new Date(),
          utcOffsetInMinutes: -300,
        },
      },
      {
        id: '2',
        userId: '1',
        order: 2,
        question: 'Did you wake up between 6 and 7AM?',
        phase: {
          timestamp: new Date(),
          utcOffsetInMinutes: -300,
        },
      },
      {
        id: '3',
        userId: '1',
        order: 3,
        question: 'Did you eat breakfast before 8AM?',
        phase: {
          timestamp: new Date(),
          utcOffsetInMinutes: -300,
        },
      },
    ]

    render(<QuestionListComponent questions={recurringQuestions} />)

    const listItems = screen.getAllByRole('listitem')

    const first = 0
    const firstQuestionText = within(listItems[first]).getByText(recurringQuestions[first].question)
    expect(firstQuestionText).toBeInTheDocument()

    const second = 1
    const secondQuestionText = within(listItems[second]).getByText(recurringQuestions[second].question)
    expect(secondQuestionText).toBeInTheDocument()

    const third = 2
    const thirdQuestionText = within(listItems[third]).getByText(recurringQuestions[third].question)
    expect(thirdQuestionText).toBeInTheDocument()
  })
})
