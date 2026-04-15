import { obterCoordenadas } from '../../utils/geocodingService.js'
import * as restauranteService from '../restauranteService.js'
import { GraphQLError } from 'graphql'
import { criarRestauranteSchema, editarRestauranteSchema } from '../restauranteValidation.js'

export const Mutation = {
  criarRestaurante: async (_, args) => {
    const parsed = criarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }

    const { nome, descricao, endereco, latitude, longitude } = parsed.data

    let coordenadas = { latitude: latitude || 0, longitude: longitude || 0 }

    if (!latitude && !longitude && endereco) {
      try {
        const res = await obterCoordenadas(endereco)
        if (res) coordenadas = res
      } catch (error) {
        import('../../utils/logger.js').then(({ logger }) => {
          logger.error(`Falha no Geocoding para o endereço do restaurante: ${endereco}. Erro: ${error.message}`, 'RestauranteMutation');
        });
        console.log('Falha ao buscar coordenadas, usando padrão 0,0', error)
      }
    }

    return await restauranteService.criar({
      nome,
      descricao,
      endereco,
      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude
    })
  },

  editarRestaurante: async (_, args) => {
    const parsed = editarRestauranteSchema.safeParse(args)
    if (!parsed.success) {
      throw new GraphQLError(parsed.error.issues[0].message, { extensions: { code: 'BAD_USER_INPUT', zodError: parsed.error.format() } })
    }

    const { id, ...dados } = parsed.data

    if (dados.endereco) {
      const coordenadas = await obterCoordenadas(dados.endereco)
      dados.latitude = coordenadas?.latitude || 0
      dados.longitude = coordenadas?.longitude || 0
    }

    return restauranteService.editarPorId(id, dados)
  },

  deletarRestaurante: async (_, { id }) =>
    !!(await restauranteService.deletar(id))
}
