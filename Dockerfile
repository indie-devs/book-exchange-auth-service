# Build stage

FROM node:14.17.0-alpine3.13 AS development

RUN apk add --no-cache python2 make g++
RUN npm install -g pnpm   
RUN pnpm config set auto-install-peers true
RUN pnpm config set strict-peer-dependencies false

WORKDIR /usr/src/app

RUN pnpm add glob rimraf

COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma/ ./prisma/

RUN pnpm i

COPY . .

RUN pnpm build

# Production stage

FROM node:14.17.0-alpine3.13 as production
RUN apk add --no-cache python2 openssl make g++

ENV dockerize_version v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$dockerize_version/dockerize-alpine-linux-amd64-$dockerize_version.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$dockerize_version.tar.gz \
    && rm dockerize-alpine-linux-amd64-$dockerize_version.tar.gz

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN npm install -g pnpm   
RUN pnpm config set auto-install-peers true
RUN pnpm config set strict-peer-dependencies false

COPY --from=development /usr/src/app/node_modules ./node_modules

COPY --from=development /usr/src/app/package*.json ./
COPY --from=development /usr/src/app/pnpm-lock.yaml ./
COPY --from=development /usr/src/app/dist ./dist
COPY ./start-docker.sh ./start-docker.sh
COPY prisma/ ./prisma/

RUN pnpm prune --prod

RUN ["chmod", "+x", "./start-docker.sh"]

CMD ["./start-docker.sh"]


