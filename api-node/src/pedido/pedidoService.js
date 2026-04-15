import { GraphQLError } from 'graphql'
import * as pedidoRepository from './pedidoRepository.js'
import * as entregaService from '../entrega/entregaService.js'
import * as usuarioRepository from '../usuario/usuarioRepository.js'

export const listar = async () => {
  return pedidoRepository.listarPedidos()
}

export const buscarPorId = async id => {
  return pedidoRepository.buscarPedidoPorId(id)
}

export const criar = async dados => {
  let { destino_latitude, destino_longitude, usuario_id } = dados

  // Se as coordenadas nao forem enviadas, tenta pegar do perfil do usuario
  if (!destino_latitude || !destino_longitude) {
    const usuario = await usuarioRepository.buscarUsuarioPorId(usuario_id)
    if (!usuario || !usuario.latitude || !usuario.longitude) {
      throw new GraphQLError('Endereço de entrega não definido no perfil do usuário.', { extensions: { code: 'BAD_USER_INPUT' } })
    }
    destino_latitude = usuario.latitude
    destino_longitude = usuario.longitude
  }

  // status padrao de criacao do pedido
  const novoPedido = await pedidoRepository.criarPedido({
    ...dados,
    destino_latitude,
    destino_longitude,
    status: 'EM_PREPARO_ENTREGA' 
  });

  // dispara a logica de atribuicao inteligente
  try {
    await entregaService.atribuirMelhorEntregador(novoPedido.id);
  } catch (error) {
    import('../utils/logger.js').then(({ logger }) => {
      logger.error(`Falha crítica na orquestração de entrega para o pedido ${novoPedido.id}: ${error.message}`, 'PedidoService');
    });
    console.error(`[Módulo Inteligente] Falhas ao orquestrar a entrega do pedido ${novoPedido.id}:`, error.message);
  }

  return novoPedido;
}

export const editarPorId = async (id, dados) => {
  return pedidoRepository.editarPedidoPorId(id, dados)
}

export const deletar = async id => {
  return pedidoRepository.deletarPedido(id)
}

export const buscarPorUsuarioId = async id => {
  return pedidoRepository.buscarPedidoPorUsuarioId(id)
}