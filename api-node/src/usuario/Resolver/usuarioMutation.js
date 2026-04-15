import * as usuarioService from '../usuarioService.js'

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
    try {
      return await usuarioService.atualizarEndereco(user.id, args)
    } catch (error) {
      console.error('[ERRO] Falha ao atualizar endereço:', error)
      throw error
    }
  },
}
