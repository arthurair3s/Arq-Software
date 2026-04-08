import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// busca a pasta protos (docker vs host)
const getProtoPath = (filename) => {
  const pathDocker = path.resolve(__dirname, '..', '..', 'protos', filename)
  if (fs.existsSync(pathDocker)) return pathDocker
  return path.resolve(__dirname, '..', '..', '..', 'protos', filename)
}

const PROTO_PATH = getProtoPath('roteamento.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})

const roteamentoProto = grpc.loadPackageDefinition(packageDefinition)

const client = new roteamentoProto.RoteamentoService(
  process.env.ROTEAMENTO_SERVICE_URL || 'localhost:5002',
  grpc.credentials.createInsecure()
)

export default client
