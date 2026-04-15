import * as produtoService from '../produtoService.js'
import { GraphQLError } from 'graphql'
import { criarProdutoSchema, editarProdutoSchema } from '../produtoValidation.js'

export const Mutation = {
  criarProduto: async (_, args) => {
    const parsed = criarProdutoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return produtoService.criar(parsed.data)
  },

  editarProduto: async (_, args) => {
    const parsed = editarProdutoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data
    return produtoService.editarPorId(id, dados)
  },

  deletarProduto: async (_, { id }) => !!(await produtoService.deletar(id))
}
