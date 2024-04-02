FROM node:18.20.0-alpine3.19

WORKDIR /app

CMD ["npm", "run", "start:dev"]