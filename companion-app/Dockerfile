# Use official Node.js image for building
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy source code
COPY src ./src
COPY public ./public
COPY webpack.config.js ./

# Build the frontend (adjust to your build command if needed)
RUN npm run build

# Serve with a lightweight web server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]