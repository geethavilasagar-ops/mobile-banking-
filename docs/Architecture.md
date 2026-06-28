# System Architecture

# Mobile Banking Application Architecture

## Overview

The Mobile Banking Application follows a **Three-Tier Architecture**, where each layer has a dedicated responsibility. This architecture improves maintainability, scalability, security, and modularity.

---

# Architecture Layers

## 1. Presentation Layer (Client Layer)

Technology:

* Flutter
* Dart

Responsibilities:

* Displays the user interface.
* Accepts user input.
* Sends requests to the backend through REST APIs.
* Displays responses received from the backend.

Examples:

* Login Screen
* Dashboard
* Fund Transfer Screen
* Transaction History
* Profile Screen

---

## 2. Application Layer (Business Layer)

Technology:

* Spring Boot
* Java 21

Responsibilities:

* Implements business logic.
* Authenticates users.
* Validates requests.
* Processes transactions.
* Generates OTPs.
* Sends notifications.
* Interacts with the database.

Modules:

* Authentication Service
* User Service
* Account Service
* Transaction Service
* Payment Service
* Notification Service

---

## 3. Data Layer (Database Layer)

Technology:

* MySQL

Responsibilities:

* Stores application data.
* Maintains relationships between entities.
* Ensures data consistency and integrity.

Main Tables:

* Users
* Accounts
* Transactions
* Payments
* Notifications
* OTP

---

# Request Flow

1. User performs an action in the Flutter application.
2. Flutter sends an HTTPS request to the Spring Boot REST API.
3. Spring Boot validates the request.
4. Business logic is executed.
5. Required database operations are performed.
6. Spring Boot returns a JSON response.
7. Flutter displays the result to the user.

---

# DevOps Architecture

Development → Git → GitHub → Jenkins → Docker → AWS EC2 → Prometheus → Grafana

Purpose:

* Git manages source code.
* GitHub stores the remote repository.
* Jenkins automates CI/CD.
* Docker packages the application.
* AWS EC2 hosts the application.
* Prometheus collects metrics.
* Grafana visualizes application health.

---

# Advantages of Three-Tier Architecture

* Separation of Concerns
* Better Security
* Easy Maintenance
* High Scalability
* Independent Development
* Easier Testing
* Reusable Backend APIs
* Better Performance

---

# Future Enhancements

The architecture supports future modules without redesigning the complete system.

Examples:

* Fingerprint Authentication
* Face Recognition
* Loan Management
* Investment Services
* AI Fraud Detection
* QR Payments
