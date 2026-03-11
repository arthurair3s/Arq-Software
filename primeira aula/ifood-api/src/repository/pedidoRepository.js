import { pool } from '../database/connection.js'

export const listarPedidos = async () => {
  const result = await pool.query('SELECT * FROM pedidos')
  return result.rows
}

export const buscarPedidoPorId = async id => {
  const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])
  return result.rows[0]
}

export const criarPedido = async pedido => {
  const { usuario_id, status, valor_total } = pedido

  const result = await pool.query(
    `INSERT INTO pedidos (usuario_id, status, valor_total)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [usuario_id, status, valor_total]
  )

  return result.rows[0]
}

export const editarPedidoPorId = async (id, pedido) => {
  const { usuario_id, status, valor_total } = pedido

  const result = await pool.query(
    `UPDATE pedidos 
     SET usuario_id = COALESCE($1, usuario_id), 
         status = COALESCE($2, status), 
         valor_total = COALESCE($3, valor_total)
     WHERE id = $4
     RETURNING *`,
    [usuario_id, status, valor_total, id]
  )

  return result.rows[0]
}

export const deletarPedido = async id => {
  const result = await pool.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [id])
  return result.rows[0]
}
