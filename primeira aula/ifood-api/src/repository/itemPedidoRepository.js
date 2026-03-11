import { pool } from '../database/connection.js'

export const listarItensPedido = async () => {
  const result = await pool.query('SELECT * FROM itens_pedido')
  return result.rows
}

export const buscarItemPedidoPorId = async id => {
  const result = await pool.query('SELECT * FROM itens_pedido WHERE id = $1', [id])
  return result.rows[0]
}

export const buscarItensPorPedidoId = async pedido_id => {
  const result = await pool.query('SELECT * FROM itens_pedido WHERE pedido_id = $1', [pedido_id])
  return result.rows
}

export const criarItemPedido = async item => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = item

  const result = await pool.query(
    `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [pedido_id, produto_id, quantidade, preco_unitario]
  )

  return result.rows[0]
}

export const editarItemPedidoPorId = async (id, item) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = item

  const result = await pool.query(
    `UPDATE itens_pedido 
     SET pedido_id = COALESCE($1, pedido_id), 
         produto_id = COALESCE($2, produto_id), 
         quantidade = COALESCE($3, quantidade),
         preco_unitario = COALESCE($4, preco_unitario)
     WHERE id = $5
     RETURNING *`,
    [pedido_id, produto_id, quantidade, preco_unitario, id]
  )

  return result.rows[0]
}

export const deletarItemPedido = async id => {
  const result = await pool.query('DELETE FROM itens_pedido WHERE id = $1 RETURNING *', [id])
  return result.rows[0]
}
