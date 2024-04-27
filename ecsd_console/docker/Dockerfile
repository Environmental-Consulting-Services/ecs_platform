ARG NODE_VERSION=18.17.1

# ---------- Base ----------
FROM node:${NODE_VERSION}-alpine AS base
#ENV NODE_ENV production

WORKDIR /app



# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS installer
WORKDIR /app

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin 
# add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH
#COPY --chown=node:node package*.json ./
#COPY --chown=node:node ./src ./src
#COPY --chown=node:node ./public ./public
COPY --chown=node:node package*.json .

RUN npm install --legacy-peer-deps

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder
WORKDIR /app

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin 
# add `/app/node_modules/.bin` to $PATH
#ENV PATH /app/node_modules/.bin:$PATH
#COPY --chown=node:node package*.json ./
#COPY --chown=node:node ./src ./src
#COPY --chown=node:node ./public ./public
COPY --from=installer /app /app
COPY --chown=node:node ./ ./
RUN npm run build
RUN npm prune --production  --legacy-peer-deps 

# ---------- Release ----------
FROM nginx AS release
#FROM gcr.io/distroless/nodejs18-debian11 AS release
#ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
#ENV PATH=$PATH:/home/node/.npm-global/bin 
#COPY --from=builder /home/node/app/node_modules ./node_modules
#COPY --from=builder /home/node/app/build ./build
#COPY --chown=node:node package*.json ./
#USER node
#COPY --chown=node:node ./.env ./.env
#CMD ["node", "./dist/server.js"]
COPY --from=builder /app/build /usr/share/nginx/html
# Copy over the custom default configs.
COPY nginx/conf/default.conf /etc/nginx/conf.d/default.conf
#COPY ./.env /usr/share/nginx/html/runtime-env.env

COPY --from=builder /app/docker/configure-runtime.sh /usr/share/nginx/html/configure-runtime.sh
RUN chmod +x /usr/share/nginx/html/configure-runtime.sh

#COPY configs/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
#CMD ["serve", "-s", "build", "-l", "3000"]
#CMD ["nginx", "-g", "daemon off;"]
CMD ["bash", "-c", "/usr/share/nginx/html/configure-runtime.sh && nginx -g \"daemon off;\""]