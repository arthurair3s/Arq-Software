import * as entregadorService from '../entregadorService.js'

export const Query = {
  entregadores: async () => entregadorService.listar(),
  entregador: async (_, { id }) => entregadorService.buscarPorId(id)
}
