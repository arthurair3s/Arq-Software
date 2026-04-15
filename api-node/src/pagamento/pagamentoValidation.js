import { z } from 'zod'

export const criarPagamentoSchema = z.object({
  pedido_id: z.string().or(z.number()),
  metodo_pagamento: z.string().min(2, "Método de pagamento é obrigatório."),
  valor: z.coerce.number().min(0, "O valor não pode ser negativo.")
})

export const editarPagamentoSchema = z.object({
  id: z.string().or(z.number()),
  status: z.string().optional()
})
