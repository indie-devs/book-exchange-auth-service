
prisma-generate-client:
	npx prisma generate

prisma-mirgate-dev:
	npx prisma migrate dev --name=$(name)

prisma-db-pull:
	npx prisma db pull

prisma-db-push:
	npx prisma db push

prisma-deploy:
	npx prisma migrate deploy