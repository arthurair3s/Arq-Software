import * as usuarioService from '../usuarioService.js'
import { obterCoordenadas } from '../../utils/geocodingService.js'

export const Mutation = {
  login: async (_, { email, senha }) => usuarioService.login(email, senha),

  criarUsuario: async (_, args) => usuarioService.criar(args),

  editarUsuario: async (_, args) => {
    const { id, ...dados } = args
    return usuarioService.editarPorId(id, dados)
  },

  deletarUsuario: async (_, { id }) => !!(await usuarioService.deletar(id)),

  atualizarEndereco: async (_, args, { user }) => {
    if (!user || !user.id) {
      throw new Error('Não autenticado.')
    }

    let { latitude, longitude, endereco } = args

    if ((!latitude || !longitude) && endereco) {
      const coords = await obterCoordenadas(endereco)
      if (coords) {
        latitude = coords.latitude
        longitude = coords.longitude
      }
    }

    return usuarioService.atualizarEndereco(user.id, { latitude, longitude, endereco })
  },
}
