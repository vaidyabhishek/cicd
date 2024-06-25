# Dockerfile for Java Application
FROM openjdk:17-jdk-alpine

COPY target/backend-1.0-SNAPSHOT.jar /usr/app/app.jar

WORKDIR /usr/app

EXPOSE 8001

CMD ["java", "-jar", "app.jar"]
