import { SLO } from '../entities/slo'

export default interface SLORepositoryAPI {
  create(slo: SLO): Promise<SLO>
  read(id?: string): Promise<SLO> | Promise<SLO[]> | null
}
