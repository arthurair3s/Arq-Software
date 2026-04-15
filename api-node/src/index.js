import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { GraphQLError } from 'graphql'

import { resolvers } from './resolvers.js'
import { verificarToken } from './usuario/usuarioService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadedFiles = loadFilesSync(path.join(__dirname, '**/*.graphql'))
const typeDefs = mergeTypeDefs(loadedFiles)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (formattedError, error) => {
    // Repassa os erros do Zod validamente para o Frontend
    if (error?.extensions?.code === 'BAD_USER_INPUT' && error?.extensions?.zodError) {
      return {
        ...formattedError,
        message: error.message,
        details: error.extensions.zodError
      }
    }
    return formattedError;
  }
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  cors: {
    origin: '*',
    credentials: true
  },
  context: async ({ req }) => {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    const user = token ? verificarToken(token) : null
    return { user }
  }
})

console.log(`Servidor rodando em ${url}`)
