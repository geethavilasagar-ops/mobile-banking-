# Technology Stack

# Mobile Banking Application

This document describes all the technologies used in the Mobile Banking Application and explains why each technology was selected.

---

# Frontend

## Flutter

Purpose:
Develops the Android mobile application using a single codebase.

Why Flutter?

* Fast UI development
* Cross-platform support
* Rich widget library
* Excellent performance

Language:
Dart

---

# Backend

## Spring Boot

Purpose:
Develops REST APIs and implements the business logic of the application.

Why Spring Boot?

* Rapid application development
* REST API support
* Dependency Injection
* Easy integration with MySQL
* Enterprise-level framework

Language:
Java 21

---

# Database

## MySQL

Purpose:
Stores all application data such as users, accounts, transactions, OTPs, and notifications.

Why MySQL?

* Reliable relational database
* Supports ACID transactions
* Excellent performance
* Easy integration with Spring Boot

---

# Version Control

## Git

Purpose:
Tracks every change made to the project.

Benefits:

* Version history
* Collaboration
* Easy rollback
* Branch management

---

# Remote Repository

## GitHub

Purpose:
Stores the remote copy of the project.

Benefits:

* Collaboration
* Backup
* Pull Requests
* Issue Tracking

---

# Containerization

## Docker

Purpose:
Packages the application with all its dependencies into portable containers.

Benefits:

* Same environment everywhere
* Easy deployment
* Lightweight virtualization

---

# CI/CD

## Jenkins

Purpose:
Automates building, testing, and deployment.

Responsibilities:

* Pull code from GitHub
* Build the project
* Execute tests
* Build Docker images
* Deploy automatically

---

# Cloud Platform

## AWS EC2

Purpose:
Hosts the deployed application.

Benefits:

* Scalable
* Reliable
* Secure
* Easy deployment

---

# Monitoring

## Prometheus

Purpose:
Collects application metrics.

Examples:

* CPU Usage
* Memory Usage
* Request Count
* Response Time

---

## Grafana

Purpose:
Visualizes metrics collected by Prometheus.

Benefits:

* Dashboards
* Alerts
* Performance Monitoring

---

# API Testing

## Postman

Purpose:
Tests REST APIs before frontend integration.

---

# Backend Testing

## JUnit

Purpose:
Performs unit testing for backend components.

---

# Technology Summary

| Layer                | Technology           |
| -------------------- | -------------------- |
| Mobile App           | Flutter              |
| Programming Language | Dart                 |
| Backend              | Spring Boot          |
| Programming Language | Java 21              |
| Database             | MySQL                |
| Version Control      | Git                  |
| Repository           | GitHub               |
| Containerization     | Docker               |
| CI/CD                | Jenkins              |
| Cloud                | AWS EC2              |
| Monitoring           | Prometheus + Grafana |
| API Testing          | Postman              |
| Unit Testing         | JUnit                |
