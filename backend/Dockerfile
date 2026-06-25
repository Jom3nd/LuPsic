FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para o node-gyp (usado pelo bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Gerar o build do TypeScript
RUN npm run build

EXPOSE 3000

# ENV NODE_ENV=development
ENV NODE_ENV=production
# Executar migrações e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
