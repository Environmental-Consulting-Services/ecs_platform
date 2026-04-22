

# ---------- Base ----------
FROM eclipse-temurin:17-jdk-alpine AS base
#ENV NODE_ENV production
#COPY target/mail-0.0.1-SNAPSHOT.jar mail-0.0.1-SNAPSHOT.jar
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /usr/springboot/app

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
# - dist: A production build compiled with Babel
FROM base AS builder
WORKDIR /usr/springboot/app
COPY --chown=spring:spring .mvn/ ./.mvn/
COPY --chown=spring:spring pom.xml mvnw mvnw.cmd ./
#RUN npm install
COPY --chown=spring:spring ./src ./src
RUN ./mvnw clean package
#RUN npm prune --production # Remove dev dependencies

# ---------- Release ----------
FROM base AS release
#FROM gcr.io/distroless/nodejs18-debian11 AS release
WORKDIR /usr/springboot/app
COPY --chown=spring:spring --from=builder /usr/springboot/app/target/mail-0.0.1-SNAPSHOT.jar ./mail-0.0.1-SNAPSHOT.jar
#COPY --from=builder /usr/node/app/dist ./dist
#COPY --chown=node:node package*.json ./
#USER node
#COPY --chown=node:node ./.env ./.env
#CMD ["node", "./dist/server.js"]
EXPOSE 8080
CMD ["java", "-jar",  "./mail-0.0.1-SNAPSHOT.jar"]
