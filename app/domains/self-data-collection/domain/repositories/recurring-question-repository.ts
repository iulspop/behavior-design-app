import type { RecurringQuestion } from '../entities/recurring-question'

export interface RecurringQuestionRepositoryAPI {
  create(recurringQuestion: RecurringQuestion): Promise<RecurringQuestion>
  read(id: string): Promise<RecurringQuestion | null>
  readAll(): Promise<RecurringQuestion[]>
  update(id: string, partialRecurringQuestion: Partial<RecurringQuestion>): Promise<RecurringQuestion>
  delete(id: string): Promise<RecurringQuestion>
}
