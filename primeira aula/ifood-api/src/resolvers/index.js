import { usuarioResolver } from './usuarioResolver.js'
import { restauranteResolver } from './restauranteResolver.js'
import { produtoResolver } from './produtoResolver.js'
import { pedidoResolver } from './pedidoResolver.js'
import { itemPedidoResolver } from './itemPedidoResolver.js'

export const resolvers = [
  usuarioResolver,
  restauranteResolver,
  produtoResolver,
  pedidoResolver,
  itemPedidoResolver
]
