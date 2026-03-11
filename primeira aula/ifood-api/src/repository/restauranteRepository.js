import { pool } from '../database/connection.js'

export const listarRestaurantes = async () => {
  const result = await pool.query('SELECT * FROM restaurantes')
  return result.rows
}

export const buscarRestaurantePorId = async id => {
  const result = await pool.query('SELECT * FROM restaurantes WHERE id = $1', [id])
  return result.rows[0]
}

export const criarRestaurante = async restaurante => {
  const { nome, descricao, endereco } = restaurante

  const result = await pool.query(
    `INSERT INTO restaurantes (nome, descricao, endereco)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nome, descricao, endereco]
  )

  return result.rows[0]
}

export const editarRestaurantePorId = async (id, restaurante) => {
  const { nome, descricao, endereco } = restaurante

  const result = await pool.query(
    `UPDATE restaurantes 
     SET nome = COALESCE($1, nome), 
         descricao = COALESCE($2, descricao), 
         endereco = COALESCE($3, endereco)
     WHERE id = $4
     RETURNING *`,
    [nome, descricao, endereco, id]
  )

  return result.rows[0]
}

export const deletarRestaurante = async id => {
  const result = await pool.query('DELETE FROM restaurantes WHERE id = $1 RETURNING *', [id])
  return result.rows[0]
}
