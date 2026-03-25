FROM node:20-alpine

WORKDIR /app

# copia os pacotes
COPY package*.json ./

# instala as dependencias
RUN npm install

# copia o codigo do projeto
COPY . .

# gera o client do prisma
RUN npx prisma generate

# expoe a porta da api
EXPOSE 4000

# inicia o servidor
CMD ["npm", "run", "dev"]
