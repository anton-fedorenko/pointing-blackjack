# Stage 1: Build the app
FROM node:12 AS builder

WORKDIR /pointing-blackjack

# Copy everything except the.dockerignore file
COPY . .

# Build backend
RUN cd server && npm install && npx tsc
# Build Frontend
RUN cd frontend && npm install && npx ng build --prod

# Stage 2: Production environment
FROM node:12

WORKDIR /pointing-blackjack

# Copy only the built files from the previous stage
COPY --from=builder /pointing-blackjack/dist ./dist
COPY --from=builder /pointing-blackjack/package*.json ./

# Install production dependencies only
RUN npm install --production

EXPOSE 8021

CMD ["node", "dist/server.js"]
