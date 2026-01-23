# Use Node.js 20.17.0 as specified in package.json
FROM node:20.17.0-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY . .

EXPOSE ${PORT}

ENV NODE_ENV=production

CMD ["yarn", "start"]
