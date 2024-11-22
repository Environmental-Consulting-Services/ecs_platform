cdeARG NODE_VERSION=18.17.1

# ---------- Base ----------
FROM node:${NODE_VERSION}-alpine AS base
#ENV NODE_ENV production
WORKDIR /usr/node/app
# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder
COPY --chown=node:node package*.json .babelrc ./
RUN npm install
COPY --chown=node:node ./src ./src
RUN npm run build
RUN npm prune --production # Remove dev dependencies

# ---------- Release ----------
FROM node:${NODE_VERSION}-alpine  AS release
#FROM gcr.io/distroless/nodejs18-debian11 AS release
WORKDIR /usr/node/app
COPY --from=builder /usr/node/app/node_modules ./node_modules
COPY --from=builder /usr/node/app/dist ./dist
COPY --chown=node:node package*.json ./
USER node
#COPY --chown=node:node ./.env ./.env
#CMD ["node", "./dist/server.js"]
EXPOSE 8080
CMD ["node", "./dist/server.js"]