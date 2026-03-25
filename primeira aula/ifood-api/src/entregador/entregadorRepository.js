import { prisma } from '../database/connection.js'

export const listarEntregadores = async () => {
  return await prisma.entregadores.findMany()
}

export const buscarEntregadorPorId = async id => {
  return await prisma.entregadores.findUnique({
    where: { id: Number(id) }
  })
}

export const criarEntregador = async entregador => {
  const { nome, telefone, veiculo } = entregador
  return await prisma.entregadores.create({
    data: { nome, telefone, veiculo }
  })
}

export const editarEntregadorPorId = async (id, entregador) => {
  const { nome, telefone, veiculo } = entregador
  return await prisma.entregadores.update({
    where: { id: Number(id) },
    data: {
      nome: nome || undefined,
      telefone: telefone || undefined,
      veiculo: veiculo || undefined
    }
  })
}

export const deletarEntregador = async id => {
  return await prisma.entregadores.delete({
    where: { id: Number(id) }
  })
}
