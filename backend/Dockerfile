# Dockerfile for Java Application
FROM openjdk:11-jre-slim

COPY target/backend-1.0-SNAPSHOT.jar /usr/app/app.jar

WORKDIR /usr/app

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
