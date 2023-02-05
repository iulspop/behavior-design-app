import * as R from 'ramda'
import { Event } from '../entities/event'
import { SLO } from '../entities/slo'
import { SLOsAPI } from './slos'
import { StreamsAPI } from './streams'

interface MonitorAPI {
  currentPercentage: (sloId: string) => Promise<number>
  maxPossiblePercentage: (sloId: string) => Promise<number>
  budget: (sloId: string) => Promise<number>
  spentBudget: (sloId: string) => Promise<number>
  remainingBudget: (sloId: string) => Promise<number>
}

export const Monitor =
  (SLOs: SLOsAPI) =>
  (Streams: StreamsAPI): MonitorAPI => ({
    currentPercentage: R.pipeWith(R.andThen)([
      loadSLOandResults(SLOs)(Streams),
      async ({ slo, results }) => currentPercentage(slo.denominator)(results),
    ]),
    maxPossiblePercentage: R.pipeWith(R.andThen)([loadSLOandResults(SLOs)(Streams), toPromise(maxPossiblePercentage)]),
    budget: R.pipeWith(R.andThen)([
      SLOs.read,
      async ({ denominator, targetPercentage }) => budget(denominator)(targetPercentage),
    ]),
    spentBudget: R.pipeWith(R.andThen)([
      Streams.findBySLOId,
      R.prop('id'),
      Streams.readEvents,
      toPromise(interpret),
      toPromise(spentBudget),
    ]),
    remainingBudget: R.pipeWith(R.andThen)([
      loadSLOandResults(SLOs)(Streams),
      async ({ slo, results }) => remainingBudget(budget(slo.denominator)(slo.targetPercentage))(spentBudget(results)),
    ]),
  })

const loadSLOandResults = (SLOs: SLOsAPI) => (Streams: StreamsAPI) =>
  R.pipeWith(R.andThen)([
    SLOs.read,
    async slo => ({ slo, stream: await Streams.findBySLOId(slo.id) }),
    async ({ slo, stream }) => ({ slo, results: interpret(await Streams.readEvents(stream.id)) }),
  ])

const toPromise =
  <X, Y>(f: (n: X) => Y) =>
  (value: X): Promise<Awaited<Y>> =>
    Promise.resolve(f(value))

type Results = boolean[]
type Interpret = (events: Event[]) => Results
export const interpret: Interpret = events => events.map(event => event.data.response)

type MaxPossiblePercentage = (_: { slo: Partial<SLO>; results: Results }) => number
export const maxPossiblePercentage: MaxPossiblePercentage = ({ slo: { denominator }, results }) =>
  toSecondDecimal((denominator - spentBudget(results)) / denominator)

type CurrentPercentage = (denominator: SLO['denominator']) => (results: Results) => number
export const currentPercentage: CurrentPercentage = denominator => results =>
  toSecondDecimal(results.filter(result => result).length / denominator)

type Budget = (denominator: SLO['denominator']) => (targetPercentage: SLO['targetPercentage']) => number
export const budget: Budget = denominator => targetPercentage => Math.floor((1 - targetPercentage) * denominator)

type SpentBudget = (results: Results) => number
export const spentBudget: SpentBudget = results => results.filter(result => !result).length

type RemainingBudget = (budget: number) => (spentBudget: number) => number
export const remainingBudget: RemainingBudget = budget => spentBudget => budget - spentBudget

const toSecondDecimal = (num: number): number => Math.floor(num * 100) / 100
