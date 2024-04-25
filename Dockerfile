FROM node:18.20.0

WORKDIR /app

CMD ["sh", "-c", "./init.sh && npm run start:dev"]
