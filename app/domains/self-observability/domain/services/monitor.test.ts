import { test } from 'vitest'
import Answer from '~/domains/self-data-collection/domain/entities/answer'
import db from '../../../db.server'
import { EventRepository } from '../../infrastructure/event-prisma'
import { SLORepository } from '../../infrastructure/slo-prisma'
import { StreamRepository } from '../../infrastructure/stream-prisma'
import { eventFactory } from '../entities/event'
import { SLO } from '../entities/slo'
import { Stream } from '../entities/stream'
import { InquireRepositoryAPI } from '../repositories/inquire-repository'
import {
  budget,
  currentPercentage,
  interpret,
  maxPossiblePercentage,
  Monitor,
  remainingBudget,
  spentBudget,
} from './monitor'
import { SLOs } from './slos'
import { Streams } from './streams'

const MockInquireRepository = (answers: Partial<Answer>[] = []): InquireRepositoryAPI => ({
  getAnswers: async () => answers,
})

test('Monitor calculations', async () => {
  await db.slo.deleteMany()

  const slos = SLOs(SLORepository())
  const slo: Partial<SLO> = { name: 'Go to Bed By 10PM', denominator: 365, targetPercentage: 0.95 }
  const createdSLO = await slos.create(slo)

  const questionId = 'tz4a98xxat96iws9zmbrgj3a'
  const answers: Partial<Answer>[] = [
    ...Array(183)
      .fill(0)
      .map((_, i) => ({
        questionId,
        response: true,
      })),
    { questionId, response: false },
  ]

  const streams = Streams(MockInquireRepository(answers))(StreamRepository())(EventRepository())
  const stream: Partial<Stream> = {
    sloId: createdSLO.id,
    source: questionId,
  }
  await streams.create(stream)

  const monitor = Monitor(slos)(streams)

  expect(await monitor.currentPercentage(createdSLO.id)).toEqual(0.5)
  expect(await monitor.maxPossiblePercentage(createdSLO.id)).toEqual(0.99)
  expect(await monitor.budget(createdSLO.id)).toEqual(18)
  expect(await monitor.spentBudget(createdSLO.id)).toEqual(1)
  expect(await monitor.remainingBudget(createdSLO.id)).toEqual(17)
})

describe('interpret()', () => {
  test('given Events: returns interpreted Results', () => {
    // prettier-ignore
    const events = [
      { data: { response: true } },
      { data: { response: false } },
      { data: { response: true } },
    ].map(event => eventFactory(event))

    const results = interpret(events)

    expect(results).toEqual([true, false, true])
  })
})

describe('maxPossiblePercentage()', () => {
  test('given denominator and results: returns max possible percentage if all further results are positive', () => {
    expect(maxPossiblePercentage(5)([true])).toEqual(1)
    expect(maxPossiblePercentage(5)([false])).toEqual(0.8)
    expect(maxPossiblePercentage(10)([false, false, true, false])).toEqual(0.7)
  })

  test('given denominator and results: returns max possible percentage percentage chopped to two decimals', () => {
    expect(maxPossiblePercentage(3)([false])).toEqual(0.66)
  })
})

describe('currentPercentage()', () => {
  test('given denominator and results: returns percentage of positive results out of total', () => {
    expect(currentPercentage(5)([true])).toEqual(0.2)
    expect(currentPercentage(5)([false])).toEqual(0)
    expect(currentPercentage(10)([false, false, true, false])).toEqual(0.1)
  })

  test('given denominator and results: returns percentage of positive results chopped to two decimals', () => {
    expect(currentPercentage(3)([true])).toEqual(0.33)
  })
})

describe('budget()', () => {
  test('given denominator and target positive results percentage: returns negative result budget', () => {
    expect(budget(5)(0.2)).toEqual(4)
    expect(budget(5)(0.5)).toEqual(2)
    expect(budget(10)(1)).toEqual(0)
  })

  test('given denominator and target positive results percentage: returns negative result budget floored', () => {
    expect(budget(5)(0.5)).toEqual(2)
  })
})

describe('spentBudget()', () => {
  test('given results: counts negative results', () => {
    expect(spentBudget([true])).toEqual(0)
    expect(spentBudget([false])).toEqual(1)
    expect(spentBudget([false, false, true, false])).toEqual(3)
  })
})

describe('remainingBudget()', () => {
  test('given budget and spent budget: returns remaining negative result budget', () => {
    expect(remainingBudget(5)(1)).toEqual(4)
    expect(remainingBudget(5)(5)).toEqual(0)
  })
})
