import * as entregadorService from '../entregadorService.js'
import { GraphQLError } from 'graphql'
import { criarEntregadorSchema, editarEntregadorSchema, atualizarStatusEntregadorSchema, atualizarLocalizacaoEntregadorSchema } from '../entregadorValidation.js'

export const Mutation = {
  criarEntregador: async (_, args) => {
    const parsed = criarEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return entregadorService.criar(parsed.data)
  },

  editarEntregador: async (_, args) => {
    const parsed = editarEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    const { id, ...dados } = parsed.data
    return entregadorService.editarPorId(id, dados)
  },

  deletarEntregador: async (_, { id }) => !!(await entregadorService.deletar(id)),

  atualizarStatusEntregador: async (_, args) => {
    const parsed = atualizarStatusEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT' } })
    }
    return await entregadorService.atualizarStatus(parsed.data.id, parsed.data.novoStatus)
  },

  atualizarLocalizacaoEntregador: async (_, args) => {
    const parsed = atualizarLocalizacaoEntregadorSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT' } })
    }
    return await entregadorService.atualizarLocalizacao(parsed.data.id, parsed.data.latitude, parsed.data.longitude)
  },

  povoarFrota: async () => {
    import('../../utils/logger.js').then(({ logger }) => {
      logger.info('Iniciando script de povoamento da frota de entregadores.', 'EntregadorMutation');
    });
    return await entregadorService.povoarFrota()
  }
}
