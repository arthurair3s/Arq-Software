import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as usuarioRepository from './usuarioRepository.js'

const JWT_SECRET = process.env.JWT_SECRET || 'express-delivery-secret-key-2026'
const SALT_ROUNDS = 10

export const listar = async () => {
  return usuarioRepository.listarUsuarios()
}

export const buscarPorId = async id => {
  return usuarioRepository.buscarUsuarioPorId(id)
}

export const buscarPorEmail = async email => {
  return usuarioRepository.buscarUsuarioPorEmail(email)
}

export const criar = async dados => {
  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
  }
  return usuarioRepository.criarUsuario(dados)
}

export const editarPorId = async (id, dados) => {
  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
  }
  return usuarioRepository.editarUsuarioPorId(id, dados)
}

export const deletar = async id => {
  return usuarioRepository.deletarUsuario(id)
}

export const login = async (email, senha) => {
  const usuario = await usuarioRepository.buscarUsuarioPorEmail(email)
  if (!usuario) {
    throw new Error('E-mail ou senha incorretos.')
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) {
    throw new Error('E-mail ou senha incorretos.')
  }

  const token = jwt.sign(
    { iss: 'express-delivery-app', id: usuario.id, email: usuario.email, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, usuario }
}

export const verificarToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export const atualizarEndereco = async (id, dados) => {
  return usuarioRepository.atualizarEndereco(id, dados)
}
