import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'
import * as usuarioRepository from './usuarioRepository.js'

import { logger } from '../utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada. A aplicação será encerrada.', 'AuthService');
  throw new Error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.')
}

const SALT_ROUNDS = 10

export const listar = async () => {
  return usuarioRepository.listarUsuarios()
}

export const buscarPorId = async id => {
  const usuario = await usuarioRepository.buscarUsuarioPorId(id)
  if (!usuario) {
    logger.warn(`Tentativa de busca por usuário inexistente. ID: ${id}`, 'UsuarioService');
  }
  return usuario
}

export const buscarPorEmail = async email => {
  return usuarioRepository.buscarUsuarioPorEmail(email)
}

export const criar = async dados => {
  if (dados.senha) {
    dados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS)
  }
  const novoUsuario = await usuarioRepository.criarUsuario(dados)
  logger.debug(`Novo usuário criado: ${novoUsuario.email} (ID: ${novoUsuario.id})`, 'UsuarioService');
  return novoUsuario
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
    logger.warn(`Tentativa de login com e-mail inexistente: ${email}`, 'AuthService');
    throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) {
    logger.warn(`Falha de senha para o usuário: ${email}`, 'AuthService');
    throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'UNAUTHENTICATED' } })
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
  } catch (err) {
    logger.warn(`Token inválido ou expirado detectado: ${err.message}`, 'AuthService');
    return null
  }
}

export const atualizarEndereco = async (id, dados) => {
  return usuarioRepository.atualizarEndereco(id, dados)
}
