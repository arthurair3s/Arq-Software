import { Query } from './entregaQuery.js'
import { Mutation } from './entregaMutation.js'
import * as pedidoRepository from '../../pedido/pedidoRepository.js'
import * as entregadorService from '../../entregador/entregadorService.js'
import * as roteamentoService from '../../roteamento/roteamentoService.js'
import * as restauranteRepository from '../../restaurante/restauranteRepository.js'
import * as entregaService from '../entregaService.js'

export const entregaResolver = {
  Query,
  Mutation,
  Entrega: {
    pedido: async parent => {
      if (!parent.pedido_id) return null
      return pedidoRepository.buscarPedidoPorId(parent.pedido_id)
    },
    entregador: async parent => {
      if (!parent.entregador_id) return null
      return entregadorService.buscarPorId(parent.entregador_id)
    },
    rota: async (parent, args, context, info) => {
      // 1. log para debug da entrega no resolver
      console.log(`[DEBUG ROTA] Entrega ID: ${parent.id}, Status: "${parent.status}", PedidoID: ${parent.pedido_id}`);
      
      if (!parent.entregador_id || !parent.pedido_id) return null;
      
      const entregador = await entregadorService.buscarPorId(parent.entregador_id);
      const pedido = await pedidoRepository.buscarPedidoPorId(parent.pedido_id);
      
      if (!entregador || !pedido) return null;
      
      if (entregador.latitude === 0 && entregador.longitude === 0) {
          console.warn('[Rota] Entregador em 0,0');
          return null;
      }

      // destino padrao: cliente
      let destLat = pedido.destino_latitude;
      let destLon = pedido.destino_longitude;

      // normaliza status para evitar erro de case-mismatch
      const currentStatus = (parent.status || "").trim().toUpperCase();

      if (currentStatus === 'ATRIBUIDA') {
        // tenta buscar o id do restaurante no pedido
        const restId = pedido.restaurante_id || pedido.restauranteId; 
        if (restId) {
          const restaurante = await restauranteRepository.buscarRestaurantePorId(restId);
          if (restaurante && restaurante.latitude && restaurante.longitude) {
            destLat = restaurante.latitude;
            destLon = restaurante.longitude;
            console.log(`[Rota] >>> FASE COLETA (Buscando no Restaurante ${restaurante.id})`);
          } else {
            console.warn(`[Rota] Restaurante ${restId} não encontrado ou sem coordenadas.`);
          }
        } else {
          console.warn(`[Rota] Campo restaurante_id não encontrado no objeto Pedido.`);
        }
      } else {
        console.log(`[Rota] >>> FASE ENTREGA (Indo para o Cliente)`);
      }

      if (destLat == null || destLon == null) return null;

      try {
        // usa rota estavel do cache para evitar oscilacao de pontos durante o trajeto
        return await entregaService.obterRotaEstavel(parent.id);
      } catch (error) {
        return null;
      }
    },
    resumo_trajeto: async (parent) => {
      if (!parent.entregador_id || !parent.pedido_id) return null;
      
      const entregador = await entregadorService.buscarPorId(parent.entregador_id);
      const pedido = await pedidoRepository.buscarPedidoPorId(parent.pedido_id);
      
      if (!entregador || !pedido) return null;

      let destLat = pedido.destino_latitude;
      let destLon = pedido.destino_longitude;

      const currentStatus = (parent.status || "").trim().toUpperCase();

      if (currentStatus === 'ATRIBUIDA') {
        const restId = pedido.restaurante_id || pedido.restauranteId;
        if (restId) {
          const restaurante = await restauranteRepository.buscarRestaurantePorId(restId);
          if (restaurante && restaurante.latitude && restaurante.longitude) {
            destLat = restaurante.latitude;
            destLon = restaurante.longitude;
          }
        }
      }

      if (destLat == null || destLon == null) return null;

      try {
        return await roteamentoService.calcularResumo(entregador.latitude, entregador.longitude, destLat, destLon);
      } catch (error) {
        return null;
      }
    },
    rota_coleta: async (parent) => {
      return entregaService.obterRotaColeta(parent.id);
    },
    rota_entrega: async (parent) => {
      return entregaService.obterRotaEntrega(parent.id);
    }
  },
}
