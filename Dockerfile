# Stage 1: Build the app
FROM node:16 AS builder

WORKDIR /pointing-blackjack

# Copy everything
COPY ./frontend ./frontend
COPY ./server ./server
COPY ./package*.json .

# Build backend
RUN cd server && npm install && npx tsc
# Build Frontend
RUN cd frontend && npm install -f && npx ng build --prod

# Stage 2: Production environment
FROM node:16

WORKDIR /pointing-blackjack

# Copy only the built files from the previous stage
COPY --from=builder /pointing-blackjack/dist ./dist
COPY --from=builder /pointing-blackjack/package*.json ./

# Install production dependencies only
RUN npm install --production

EXPOSE 8021

CMD ["node", "dist/server.js"]
