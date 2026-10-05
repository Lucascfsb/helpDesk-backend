FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db" 
# Valor fictício

RUN npx prisma generate
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "dev"]