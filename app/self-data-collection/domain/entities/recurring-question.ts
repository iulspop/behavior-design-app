import { createId } from '@paralleldrive/cuid2'

export interface RecurringQuestion {
  id: string
  userId: string
  order: number
  text: string
  timestamp: Date
  utcOffsetInMinutes: number
}

export type CreateRecurringQuestionCommand = Omit<RecurringQuestion, 'id' | 'order'> &
  Partial<Pick<RecurringQuestion, 'id' | 'order'>>

export const recurringQuestionFactory = ({
  id = createId(),
  userId,
  order = 999_999,
  text,
  timestamp,
  utcOffsetInMinutes,
}): RecurringQuestion => ({
  id,
  userId,
  order,
  text,
  timestamp,
  utcOffsetInMinutes,
})
