FROM --platform=linux/arm/v7 node:16.14-slim
WORKDIR /usr/src/wise-phil
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]