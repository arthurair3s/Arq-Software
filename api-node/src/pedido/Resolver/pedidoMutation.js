import * as pedidoService from '../pedidoService.js'
import { GraphQLError } from 'graphql'
import { criarPedidoSchema, editarPedidoSchema } from '../pedidoValidation.js'

export const Mutation = {
  criarPedido: async (_, args) => {
    const parsed = criarPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return pedidoService.criar(parsed.data)
  },

  editarPedido: async (_, args) => {
    const parsed = editarPedidoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data
    return pedidoService.editarPorId(id, dados)
  },

  deletarPedido: async (_, { id }) => !!(await pedidoService.deletar(id))
}
