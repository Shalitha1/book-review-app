# Book Review App - Kubernetes Deployment Guide

## Overview

This guide explains how to deploy the Book Review App using Docker and
Kubernetes on a local macOS machine.

Application stack:

-   Frontend: Next.js + React
-   Backend: Node.js + Express
-   Database: MySQL 8
-   Kubernetes Platform: Minikube
-   Container Runtime: Docker

Final architecture:

    Browser
       |
       |
    LoadBalancer Service
       |
    Frontend Pod
    Next.js
    Port 80/3000
       |
    Backend ClusterIP Service
       |
    Backend Pod
    Node.js Express
    Port 3010
       |
    MySQL Service
       |
    MySQL StatefulSet
       |
    Persistent Volume

------------------------------------------------------------------------

# PART 01 - Install Kubernetes Tools

## Step 01 - Install Homebrew

Check:

``` bash
brew --version
```

Install if missing:

``` bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

------------------------------------------------------------------------

## Step 02 - Install kubectl

``` bash
brew install kubectl
```

Verify:

``` bash
kubectl version --client
```

------------------------------------------------------------------------

## Step 03 - Install Minikube

``` bash
brew install minikube
```

Verify:

``` bash
minikube version
```

------------------------------------------------------------------------

## Step 04 - Install Helm

``` bash
brew install helm
```

Verify:

``` bash
helm version
```

------------------------------------------------------------------------

# PART 02 - Start Local Kubernetes Cluster

Machine:

-   macOS
-   M1 chip
-   8GB RAM

Start Minikube:

``` bash
minikube start \
--driver=docker \
--cpus=2 \
--memory=4096
```

Check:

``` bash
kubectl get nodes
```

Expected:

    NAME       STATUS
    minikube   Ready

------------------------------------------------------------------------

# PART 03 - Dockerize Backend

Project:

    book-review-app-upgrade

    backend
    frontend
    docker-compose.yml

Go to backend:

``` bash
cd backend
```

Create:

    backend/
    ├── Dockerfile
    └── .dockerignore

------------------------------------------------------------------------

## Backend Dockerfile

Create:

    backend/Dockerfile

Content:

``` dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3010

CMD ["npm","start"]
```

------------------------------------------------------------------------

## Backend Docker Ignore

Create:

    backend/.dockerignore

Content:

    node_modules
    .env
    .git
    npm-debug.log

------------------------------------------------------------------------

## Build Backend Image

From project root:

``` bash
docker build \
-t bookreview-backend:v1 \
./backend
```

Check:

``` bash
docker images
```

------------------------------------------------------------------------

# PART 04 - Dockerize Frontend

Go to frontend:

``` bash
cd frontend
```

Create:

    frontend/
    ├── Dockerfile
    └── .dockerignore

------------------------------------------------------------------------

## Frontend Dockerfile

``` dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

RUN npm install --production

EXPOSE 3000

CMD ["npm","start"]
```

------------------------------------------------------------------------

## Frontend Docker Ignore

    node_modules
    .next
    .env
    .git
    npm-debug.log

------------------------------------------------------------------------

## Build Frontend Image

``` bash
docker build \
-t bookreview-frontend:v1 \
./frontend
```

Check:

``` bash
docker images
```

------------------------------------------------------------------------

# PART 05 - Test Docker Containers

## Run MySQL

``` bash
docker run -d \
--name mysql-test \
-e MYSQL_ROOT_PASSWORD=root123 \
-e MYSQL_DATABASE=book_review_db \
-e MYSQL_USER=pravin \
-e MYSQL_PASSWORD=Demo12@Test23 \
-p 3306:3306 \
mysql:8
```

------------------------------------------------------------------------

## Run Backend

``` bash
docker run -d \
--name backend-test \
-p 3010:3010 \
-e PORT=3010 \
-e DB_HOST=host.docker.internal \
-e DB_NAME=book_review_db \
-e DB_USER=pravin \
-e DB_PASS=Demo12@Test23 \
-e JWT_SECRET=mysecret \
bookreview-backend:v1
```

Check:

``` bash
docker logs backend-test
```

------------------------------------------------------------------------

## Run Frontend

``` bash
docker run -d \
--name frontend-test \
-p 3000:3000 \
bookreview-frontend:v1
```

Open:

    http://localhost:3000

------------------------------------------------------------------------

# PART 06 - Kubernetes Preparation

Create folders:

    k8s/

    ├── namespace.yaml
    │
    ├── mysql/
    │
    ├── backend/
    │
    └── frontend/

------------------------------------------------------------------------

# Step 17 - Create Namespace

File:

    k8s/namespace.yaml

Content:

``` yaml
apiVersion: v1
kind: Namespace

metadata:
  name: book-review
```

Apply:

``` bash
kubectl apply -f k8s/namespace.yaml
```

------------------------------------------------------------------------

# PART 07 - MySQL StatefulSet

Create:

    k8s/mysql/

    mysql-secret.yaml
    mysql-pvc.yaml
    mysql-statefulset.yaml
    mysql-service.yaml

------------------------------------------------------------------------

## MySQL Secret

mysql-secret.yaml

``` yaml
apiVersion: v1
kind: Secret

metadata:
  name: mysql-secret
  namespace: book-review

type: Opaque

stringData:

  MYSQL_ROOT_PASSWORD: root123
  MYSQL_DATABASE: book_review_db
  MYSQL_USER: pravin
  MYSQL_PASSWORD: Demo12@Test23
```

Apply:

``` bash
kubectl apply -f k8s/mysql/mysql-secret.yaml
```

------------------------------------------------------------------------

## Persistent Volume Claim

mysql-pvc.yaml

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim

metadata:
  name: mysql-pvc
  namespace: book-review

spec:

  accessModes:
    - ReadWriteOnce

  resources:

    requests:

      storage: 5Gi
```

Apply:

``` bash
kubectl apply -f k8s/mysql/mysql-pvc.yaml
```

------------------------------------------------------------------------

## MySQL StatefulSet

mysql-statefulset.yaml

``` yaml
apiVersion: apps/v1

kind: StatefulSet

metadata:

  name: mysql

  namespace: book-review


spec:

  serviceName: mysql-service

  replicas: 1


  selector:

    matchLabels:

      app: mysql


  template:

    metadata:

      labels:

        app: mysql


    spec:

      containers:

      - name: mysql

        image: mysql:8.0

        ports:

        - containerPort: 3306


        envFrom:

        - secretRef:

            name: mysql-secret


        volumeMounts:

        - name: mysql-storage

          mountPath: /var/lib/mysql


      volumes:

      - name: mysql-storage

        persistentVolumeClaim:

          claimName: mysql-pvc
```

Apply:

``` bash
kubectl apply -f k8s/mysql/mysql-statefulset.yaml
```

------------------------------------------------------------------------

## MySQL Service

mysql-service.yaml

``` yaml
apiVersion: v1

kind: Service

metadata:

  name: mysql-service

  namespace: book-review


spec:

  selector:

    app: mysql


  ports:

  - port: 3306

    targetPort: 3306
```

Apply:

``` bash
kubectl apply -f k8s/mysql/mysql-service.yaml
```

------------------------------------------------------------------------

## Verify MySQL

``` bash
kubectl get pods -n book-review
```

Expected:

    mysql-0 Running

Logs:

``` bash
kubectl logs mysql-0 -n book-review
```

Expected:

    ready for connections

------------------------------------------------------------------------

# Next Parts

Continue with:

## PART 08

Backend Kubernetes Deployment

Create:

-   ConfigMap
-   Secret
-   Deployment
-   ClusterIP Service

## PART 09

Frontend Kubernetes Deployment

Create:

-   Deployment
-   LoadBalancer Service
-   Ingress

## PART 10

Testing and Troubleshooting

Commands:

``` bash
kubectl logs
kubectl describe
kubectl exec
kubectl get pods
```
