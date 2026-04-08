import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// busca a pasta protos (2 niveis no docker /app, 3 no host)
const getProtoPath = (filename) => {
  const pathDocker = path.resolve(__dirname, '..', '..', 'protos', filename)
  if (fs.existsSync(pathDocker)) return pathDocker
  return path.resolve(__dirname, '..', '..', '..', 'protos', filename)
}

const PROTO_PATH = getProtoPath('entregadores.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})

const entregadorProto = grpc.loadPackageDefinition(packageDefinition)

const client = new entregadorProto.EntregadorService(
  process.env.ENTREGADORES_SERVICE_URL || 'localhost:5001',
  grpc.credentials.createInsecure()
)

export default client
