import 'dotenv/config';
import entregadorClient from './src/grpc/entregadorClient.js';
import * as entregadorService from './src/entregador/entregadorService.js';

// coordenada base (eixo maria da graca / cachambi)
const BASE_LAT = -22.9035;
const BASE_LNG = -43.1730;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function garantirFrotaMinima(entregadoresAtuais) {
  const frotaDesejada = 15;
  if (entregadoresAtuais.length >= frotaDesejada) {
    return entregadoresAtuais;
  }

  const faltam = frotaDesejada - entregadoresAtuais.length;
  console.log(`Frota pequena detectada. Recrutando ${faltam} novos entregadores dinamicamente via gRPC...`);

  for (let i = 1; i <= faltam; i++) {
    const nomeFake = `Motoqueiro ${i} (Robô)`;
    try {
      await entregadorService.criar({
        nome: nomeFake,
        telefone: `2198888${i.toString().padStart(4, '0')}`,
        veiculo: 'Moto Honda CG 160'
      });
    } catch (e) {
      console.error(`Erro ao recrutar ${nomeFake}:`, e.message);
    }
  }
  
  // retorna a lista completa do banco
  return await entregadorService.listar();
}

async function iniciarSimulador() {
  console.log("Iniciando Simulador de Frota na Zona Norte do Rio...");

  let entregadores = [];
  try {
    entregadores = await entregadorService.listar();
    // garante motoristas na regiao para as rotas
    entregadores = await garantirFrotaMinima(entregadores);
    console.log(`${entregadores.length} entregadores apostos para a frota ZN.`);
  } catch (err) {
    console.error("Erro ao falar com gRPC. O ms-entregadores-cs está rodando?", err.message);
    process.exit(1);
  }

  // abre o stream de gps com o c#
  const stream = entregadorClient.AtualizarLocalizacaoStream((error, response) => {
    if (error) {
      console.error("Erro no Stream de Localização:", error.message);
    }
  });

  console.log("\n Transmitindo posições GPS a cada 3 segundos na grande ZN");

  setInterval(() => {
    entregadores.forEach((entregador) => {
      // 1. variacao de aprox 7km de raio em volta da base
      const randomLat = (Math.random() - 0.5) * 0.13; 
      const randomLng = (Math.random() - 0.5) * 0.13;

      const latitudeAtual = BASE_LAT + randomLat;
      const longitudeAtual = BASE_LNG + randomLng;

      stream.write({
        entregador_id: entregador.id,
        latitude: latitudeAtual,
        longitude: longitudeAtual
      });

      console.log(` ${entregador.nome} espalhado em Lat: ${latitudeAtual.toFixed(4)}, Lng: ${longitudeAtual.toFixed(4)}`);
    });
  }, 3000);
}

iniciarSimulador();

