# Nexus Frontend Dockerfile (dev)
FROM node:22-bullseye

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=false

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
