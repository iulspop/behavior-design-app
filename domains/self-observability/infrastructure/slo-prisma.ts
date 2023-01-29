import db from '../../db.server'
import SLORepositoryAPI from '../domain/repositories/slo-repository'

export const SLORepository = (): SLORepositoryAPI => ({
  create: async slo => await db.slo.create({ data: slo }),
  read: async id => (id ? await db.slo.findUnique({ where: { id } }) : await db.slo.findMany()),
  update: async (id, slo) => await db.slo.update({ where: { id }, data: slo }),
  delete: async id => await db.slo.delete({ where: { id } }),
})
