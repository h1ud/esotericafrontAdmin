# ===============================================================
#   ESOTÉRICA · Backend — Dockerfile
#   Multi-stage build: Gradle + Java 21 → JRE 21 Alpine
# ===============================================================

# ---------- STAGE 1: Build ----------
FROM gradle:8.7-jdk21-alpine AS build

WORKDIR /app

# Copy gradle config first for layer caching
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN gradle bootJar --no-daemon -x test

# ---------- STAGE 2: Run ----------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Use non-root user
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
