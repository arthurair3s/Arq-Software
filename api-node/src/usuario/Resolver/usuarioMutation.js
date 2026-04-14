import * as usuarioService from '../usuarioService.js'

export const Mutation = {
  login: async (_, { email, senha }) => usuarioService.login(email, senha),

  criarUsuario: async (_, args) => usuarioService.criar(args),

  editarUsuario: async (_, args) => {
    const { id, ...dados } = args
    return usuarioService.editarPorId(id, dados)
  },

  deletarUsuario: async (_, { id }) => !!(await usuarioService.deletar(id))
}
