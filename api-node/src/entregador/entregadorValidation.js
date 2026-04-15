import { z } from 'zod'

export const criarEntregadorSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  telefone: z.string().optional().nullable(),
  veiculo: z.string().optional().nullable()
})

export const editarEntregadorSchema = z.object({
  id: z.string().or(z.number()),
  nome: z.string().optional(),
  telefone: z.string().optional().nullable(),
  veiculo: z.string().optional().nullable()
})

export const atualizarStatusEntregadorSchema = z.object({
  id: z.string().or(z.number()),
  novoStatus: z.enum(['DISPONIVEL', 'EM_ENTREGA', 'OFFLINE'], { message: "Status no formato inválido." })
})

export const atualizarLocalizacaoEntregadorSchema = z.object({
  id: z.string().or(z.number()),
  latitude: z.coerce.number({ required_error: "Latitude é obrigatória" }),
  longitude: z.coerce.number({ required_error: "Longitude é obrigatória" })
})
