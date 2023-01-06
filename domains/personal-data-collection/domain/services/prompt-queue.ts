import AnswerRepository from '../repositories/answer-repository.js'
import RecurringQuestionRepository from '../repositories/recurring-question-repository.js'
import Prompt from '../value-objects/prompt.js'
import RecurringQuestion, { createRecurringQuestion } from '../entities/recurring-question.js'
import Answer, { createAnswer } from '../entities/answer.js'

interface PromptQueueAPI {
  getAnswers: () => Promise<Answer[]>
  createAnswer: (answer: Partial<Answer>) => Promise<void>
  getRecurringQuestions: () => Promise<RecurringQuestion[]>
  createRecurringQuestion: (recurringQuestion: Partial<RecurringQuestion>) => Promise<void>
  query: (queryTimeLocal?: Date) => Promise<Prompt[]>
}

type a = (
  recurringQuestionRepository: RecurringQuestionRepository
) => (answerRepository: AnswerRepository) => PromptQueueAPI
const PromptQueue: a = recurringQuestionRepository => answerRepository => ({
  createAnswer: partialAnswer => answerRepository.create(createAnswer(partialAnswer)),
  getAnswers: answerRepository.findMany,
  createRecurringQuestion: partialRecurringQuestion =>
    recurringQuestionRepository.create(createRecurringQuestion(partialRecurringQuestion)),
  getRecurringQuestions: recurringQuestionRepository.findMany,
  query: async (
    queryTimeLocal = toLocalTime({ timestamp: new Date(), utcOffsetInMinutes: new Date().getTimezoneOffset() })
  ) => {
    const recurringQuestionList = await recurringQuestionRepository.findMany()
    const answerList = await answerRepository.findMany()
    return calculateQuery(recurringQuestionList, answerList, queryTimeLocal)
  },
})

type b = (recurringQuestionList: RecurringQuestion[], answerList: Answer[], queryTimeLocal: Date) => Prompt[]
const calculateQuery: b = (recurringQuestionList, answerList, queryTimeLocal) =>
  pipe(
    calculatePromptList(recurringQuestionList),
    keepUnlessPromptAnswered(answerList),
    filterIfCurrentDay(queryTimeLocal)
  )(queryTimeLocal)

type c = (recurringQuestionList: RecurringQuestion[]) => (queryTimeLocal: Date) => Prompt[]
const calculatePromptList: c = recurringQuestionList => queryTimeLocal =>
  // @ts-ignore
  recurringQuestionList.reduce(
    // @ts-ignore
    (promptList, { id, question, phases }) => [
      ...promptList,
      ...toDayList(toUTCTime(toStartOfDay(toLocalTime(phases[0])), phases[0].utcOffsetInMinutes), queryTimeLocal).map(
        date => ({
          questionId: id,
          question,
          timestamp: date,
        })
      ),
    ],
    []
  )

type d = (answerList: Answer[]) => (promptList: Prompt[]) => Prompt[]
const keepUnlessPromptAnswered: d = answerList => promptList =>
  promptList.filter(
    prompt =>
      !answerList.find(
        answer =>
          answer.questionId === prompt.questionId && answer.timestamp.toISOString() === prompt.timestamp.toISOString()
      )
  )

type e = (date: Date) => (promptList: Prompt[]) => Prompt[]
const filterIfCurrentDay: e = queryTimeLocal => promptList =>
  promptList.filter(
    prompt => prompt.timestamp.toISOString().split('T')[0] != queryTimeLocal.toISOString().split('T')[0]
  )

const pipe =
  (...fns: Function[]) =>
  // @ts-ignore
  x =>
    fns.reduce((v, f) => f(v), x)

const addDays = (days: number) => (date: Date) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addDay = addDays(1)

const toDayList = (startDate: Date, endDate: Date) => {
  const dayList = []
  let currentDate = startDate
  while (currentDate <= endDate) {
    dayList.push(currentDate)
    currentDate = addDay(currentDate)
  }
  return dayList
}

const toStartOfDay = (date: Date) => {
  const dateCopy = new Date(date)
  dateCopy.setUTCHours(0, 0, 0, 0)
  return dateCopy
}

type f = ({ timestamp, utcOffsetInMinutes }: { timestamp: Date; utcOffsetInMinutes: number }) => Date
const toLocalTime: f = ({ timestamp, utcOffsetInMinutes }) =>
  new Date(timestamp.getTime() - utcOffsetInMinutes * 60 * 1000)

type g = (timestamp: Date, utcOffsetInMinutes: number) => Date
const toUTCTime: g = (timestamp, utcOffsetInMinutes) => new Date(timestamp.getTime() + utcOffsetInMinutes * 60 * 1000)

export {
  PromptQueue,
  toDayList,
  calculateQuery,
  keepUnlessPromptAnswered,
  filterIfCurrentDay,
  addDays,
  addDay,
  toStartOfDay,
  toLocalTime,
}
