# Multi-stage build for Spring Boot application
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create storage directory
RUN mkdir -p /app/storage

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 10006
EXPOSE 10006

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
