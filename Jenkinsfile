pipeline {
    agent any

    environment {
        SONARQUBE_TOKEN = credentials('sonarqube-token')
        GIT_CREDENTIALS = credentials('git-credentials')
        GOOGLE_APPLICATION_CREDENTIALS = credentials('gcp-service-account')
        PROJECT_ID = 'macro-market-426811-r6'
        REGION = 'us-central1'
        REPOSITORY = 'cicd'
        NODE_APP_IMAGE = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/frontend:${BUILD_NUMBER}"
        JAVA_APP_IMAGE = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/backend:${BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS' // Ensure this matches the name configured in Global Tool Configuration
        maven 'Maven'   // Ensure this matches the name configured in Global Tool Configuration
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout([$class: 'GitSCM', branches: [[name: "master"]], userRemoteConfigs: [[url: 'https://github.com/vaidyabhishek/cicd', credentialsId: 'git-credentials']]])
                }
            }
        }

        stage('Unit Test Report') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    // Run your tests here if needed
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONARQUBE_TOKEN')]) {
                        withSonarQubeEnv('SonarQube') {
                            dir('backend') {
                                def mvnHome = tool 'Maven'
                                sh "${mvnHome}/bin/mvn clean verify sonar:sonar -Dsonar.projectKey=cicd -Dsonar.projectName='cicd' -Dsonar.host.url=http://34.110.159.100 -Dsonar.token='${SONARQUBE_TOKEN}'"
                            }
                        }
                    }
                }
            }
        }

        stage('Build and Dockerize') {
            steps {
                dir('backend') {
                    sh 'mvn clean package'
                    sh "docker build -t backend:${BUILD_NUMBER} ."
                }
                dir('frontend') {
                    sh "docker build -t frontend:${BUILD_NUMBER} ."
                }
            }
        }

        // stage('OWASP checks') {
        //     steps {
        //         script {
        //             if (!fileExists('dependency-check/bin/dependency-check.sh')) {
        //                 sh 'mkdir -p dependency-check'
        //                 sh 'curl -L https://github.com/jeremylong/DependencyCheck/releases/download/v6.5.3/dependency-check-6.5.3-release.zip -o dependency-check.zip'
        //                 sh 'unzip dependency-check.zip -d dependency-check'
        //             }
        //         }
        //         sh './dependency-check/bin/dependency-check.sh --project "my-app" --format "XML" --out "dependency-check-report.xml" --scan "."'
        //         // Assuming dependencyCheckPublisher is correctly configured
        //         // dependencyCheckPublisher pattern: 'dependency-check-report.xml'
        //     }
        // }

        stage('Push to Artifact Registry') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                        sh 'gcloud auth activate-service-account --key-file $GOOGLE_APPLICATION_CREDENTIALS'
                        sh "gcloud auth configure-docker ${REGION}-docker.pkg.dev"
                        sh "docker tag frontend:${BUILD_NUMBER} ${NODE_APP_IMAGE}"
                        sh "docker tag backend:${BUILD_NUMBER} ${JAVA_APP_IMAGE}"
                        sh "docker push ${NODE_APP_IMAGE}"
                        sh "docker push ${JAVA_APP_IMAGE}"
                    }
                }
            }
        }

        stage('Deploy to GKE') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh 'gcloud auth activate-service-account --key-file $GOOGLE_APPLICATION_CREDENTIALS'
                    sh 'gcloud container clusters get-credentials cluster-1 --region us-central1 --project macro-market-426811-r6'
                    dir('k8s') {
                        sh "sed -i 's/latest/${BUILD_NUMBER}/g' backend.yaml"
                        sh "sed -i 's/latest/${BUILD_NUMBER}/g' frontend.yaml"
                        sh 'kubectl apply -f db-secret.yaml'
                        sh 'kubectl apply -f mysql-db.yaml'
                        sh 'kubectl apply -f backend.yaml'
                        sh 'kubectl apply -f frontend.yaml'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
