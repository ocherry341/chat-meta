FROM node:18.16.0-alpine3.18 as builder
WORKDIR /app
COPY . .
RUN npm install && npx nest build

FROM node:18.16.0-alpine3.18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json /app/.env* ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start:prod"]