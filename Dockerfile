FROM node:18.20.0 as build

WORKDIR /app

RUN npm i -g pnpm

COPY . .

RUN pnpm i

RUN pnpm run build

FROM node:18.20.0

RUN npm i -g pnpm

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/init.sh .
COPY --from=build /app/.env.production .

RUN pnpm i --prod

EXPOSE 3000

CMD ["sh", "-c", "./init.sh && pnpm run start:prod"]
