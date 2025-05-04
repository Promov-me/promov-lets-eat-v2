
# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Constrói a aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS runner

WORKDIR /app

# Instala o servidor para servir os arquivos estáticos
RUN npm install -g serve

# Copia os arquivos de build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta que a aplicação utilizará
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["serve", "-s", "dist", "-l", "8080"]
