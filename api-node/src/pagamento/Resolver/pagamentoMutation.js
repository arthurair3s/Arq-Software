import * as pagamentoService from '../pagamentoService.js'
import { GraphQLError } from 'graphql'
import { criarPagamentoSchema, editarPagamentoSchema } from '../pagamentoValidation.js'

export const Mutation = {
  criarPagamento: async (_, args) => {
    const parsed = criarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return pagamentoService.criar(parsed.data)
  },

  editarPagamento: async (_, args) => {
    const parsed = editarPagamentoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data
    return pagamentoService.editarPorId(id, dados)
  },

  deletarPagamento: async (_, { id }) => !!(await pagamentoService.deletar(id))
}
