import * as usuarioService from '../usuarioService.js'

export const Query = {
  usuarios: async () => usuarioService.listar(),
  usuario: async (_, { id }) => usuarioService.buscarPorId(id),
  me: async (_, __, context) => {
    if (!context.user) return null
    return usuarioService.buscarPorId(context.user.id)
  }
}
