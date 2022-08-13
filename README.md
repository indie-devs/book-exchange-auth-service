# **BOOK EXCHANGE AUTH SERVICE GUIDE**
- [Linux machine](#linux-machine)
- [Docker](#docker)
## **LINUX MACHINE**
## Pre-requisites
- [@nestjs/cli](https://docs.nestjs.com/cli/o*verview)
- [Node: v14.x](https://nodejs.org/en/download/)
- [pnpm: 7.x](https://pnpm.io/installation)
- [Postgresql 14.x](https://www.postgresql.org/download/)
## Steps to setup service using Linux machine
1) Install the dependencies:
```sh
pnpm install
```
2) Set the environment variables:
```sh
cp .env.example .env

# update redis and postgres passwords
nano .env

```
3) Generate Prisma Client with the following command:
```sh
make prisma-generate-client 
```
## Running locally:
```sh
npm run start:dev
```
## Running in production:
```sh
npm run build && npm run start:prod

```
## Testing
```sh
npm run test
```

## **DOCKER**
## Pre-requisites
Before proceeding, make sure you have the latest version of docker and docker-compose installed.

 ```sh
$ docker --version
Docker version 20.10.12, build 20.10.12-0ubuntu4
$ docker-compose --version
docker-compose version 1.29.2, build unknown
 ```

 ## Build the image
 ```sh
    
docker build -t indie-devs/book-exchange-auth-service .
 
# With Apple Silicon should use the following command:

docker buildx build --platform linux/amd64 -t indie-devs/book-exchange-auth-service .

```

## Steps to setup service using docker-compose
1) Set the environment variables: copy file `.env` from `.env.example` and tweak it according to your preferences.

```sh
cp .env.example .env

# update redis and postgres passwords
nano .env
```

2) Get the service up and running.

```sh
docker-compose up -d
```

