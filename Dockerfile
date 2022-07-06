FROM node:16.15.1-alpine

WORKDIR /usr/local/app

RUN npm install --location=global pnpm  

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install

COPY . .

ENV AUTH_PORT=$AUTH_PORT

EXPOSE $AUTH_PORT

CMD ["npm", "start"]

