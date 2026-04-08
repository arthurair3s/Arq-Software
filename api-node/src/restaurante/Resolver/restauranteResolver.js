import { Query } from './restauranteQuery.js'
import { Mutation } from './restauranteMutation.js'

export const restauranteResolver = {
  Query,
  Mutation,
  Restaurante: {
    categorias: async (parent) => {
      // import dinamico pra evitar circular dependency
      const categoriaService = await import('../../categoria/categoriaService.js');
      return categoriaService.buscarPorRestaurante(parent.id);
    }
  }
}
