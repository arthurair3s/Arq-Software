import * as usuarioService from '../usuarioService.js'
import { obterCoordenadas } from '../../utils/geocodingService.js'
import { GraphQLError } from 'graphql'
import { loginSchema, criarUsuarioSchema, editarUsuarioSchema, atualizarEnderecoSchema } from '../usuarioValidation.js'

export const Mutation = {
  login: async (_, args) => {
    const parsed = loginSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return usuarioService.login(parsed.data.email, parsed.data.senha)
  },

  criarUsuario: async (_, args) => {
    const parsed = criarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    return usuarioService.criar(parsed.data)
  },

  editarUsuario: async (_, args) => {
    const parsed = editarUsuarioSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }
    
    const { id, ...dados } = parsed.data
    return usuarioService.editarPorId(id, dados)
  },

  deletarUsuario: async (_, { id }) => !!(await usuarioService.deletar(id)),

  atualizarEndereco: async (_, args, { user }) => {
    if (!user || !user.id) {
      throw new GraphQLError('Não autenticado.', { extensions: { code: 'UNAUTHENTICATED' } })
    }

    const parsed = atualizarEnderecoSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }

    let { latitude, longitude, endereco } = parsed.data

    if ((!latitude || !longitude) && endereco) {
      const coords = await obterCoordenadas(endereco)
      if (coords) {
        latitude = coords.latitude
        longitude = coords.longitude
      } else {
        import('../utils/logger.js').then(({ logger }) => {
          logger.warn(`Falha ao obter coordenadas para o endereço: ${endereco}`, 'GeocodingUsuario');
        });
      }
    }

    return usuarioService.atualizarEndereco(user.id, { latitude, longitude, endereco })
  },
}
