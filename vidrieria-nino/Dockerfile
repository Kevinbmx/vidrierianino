FROM node:18-alpine

WORKDIR /app

# Copia archivos de dependencias
COPY package.json package-lock.json ./

# Instala dependencias incluyendo next globalmente
RUN npm install -g next && \
    npm install --legacy-peer-deps

# Copia el resto de los archivos
COPY . .

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

CMD ["npm", "run", "dev"]