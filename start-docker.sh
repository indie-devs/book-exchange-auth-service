#!/bin/sh

npx prisma migrate deploy
pnpm start:prod