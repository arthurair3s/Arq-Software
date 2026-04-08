import * as pedidoRepository from './pedidoRepository.js'
import * as entregaService from '../entrega/entregaService.js'

export const listar = async () => {
  return pedidoRepository.listarPedidos()
}

export const buscarPorId = async id => {
  return pedidoRepository.buscarPedidoPorId(id)
}

export const criar = async dados => {
  // status padrao de criacao do pedido
  const novoPedido = await pedidoRepository.criarPedido({
    ...dados,
    status: 'EM_PREPARO_ENTREGA' 
  });

  // dispara a logica de atribuicao inteligente
  try {
    await entregaService.atribuirMelhorEntregador(novoPedido.id);
  } catch (error) {
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