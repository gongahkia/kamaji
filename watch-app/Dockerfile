FROM node:20-alpine

WORKDIR /app

RUN npm install -g @zeppos/zeus-cli

COPY . .

CMD ["zeus", "build", "--platform", "gtr4"]