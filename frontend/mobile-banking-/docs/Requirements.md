# Software Requirements Specification (SRS)

# Mobile Banking Application

## 1. Introduction

### 1.1 Purpose

The purpose of this project is to develop a secure, reliable, and scalable Mobile Banking Application that enables users to perform banking operations from their mobile devices. The application follows Software Engineering, Agile, and DevOps practices throughout the development lifecycle.

### 1.2 Objectives

* Provide secure user authentication.
* Enable users to manage their bank accounts.
* Support secure fund transfers.
* Allow users to pay utility bills.
* Provide real-time notifications.
* Demonstrate modern DevOps practices using Git, Docker, Jenkins, AWS, Prometheus, and Grafana.

---

# 2. Functional Requirements

## Authentication Module

* User Registration
* Secure Login
* OTP Verification
* MPIN Authentication
* Change MPIN
* Logout

## Account Module

* View Account Details
* View Account Balance
* View Mini Statement

## Transaction Module

* Transfer Money
* View Transaction History
* Transaction Confirmation

## Payment Module

* Mobile Recharge
* Electricity Bill Payment
* Water Bill Payment

## Profile Module

* View Profile
* Update Profile

## Notification Module

* Login Alerts
* Transaction Alerts
* Payment Alerts

---

# 3. Non-Functional Requirements

## Security

* JWT Authentication
* Password Encryption
* OTP Verification
* Secure REST APIs

## Performance

* Fast API response
* Efficient database operations

## Reliability

* Data consistency
* Error handling
* Transaction integrity

## Scalability

* Support future banking services
* Support multiple user accounts
* Modular architecture

---

# 4. Technology Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Frontend         | Flutter              |
| Backend          | Spring Boot          |
| Database         | MySQL                |
| Version Control  | Git & GitHub         |
| Containerization | Docker               |
| CI/CD            | Jenkins              |
| Cloud            | AWS EC2              |
| Monitoring       | Prometheus & Grafana |

---

# 5. Target Users

* Bank Customers
* Bank Administrators (Future Enhancement)

---

# 6. Assumptions

* Internet connection is available.
* Users have registered bank accounts.
* Users complete OTP verification before accessing banking services.

---

# 7. Future Scope

* QR Code Payments
* Fingerprint Authentication
* Face Recognition Login
* AI-based Fraud Detection
* Loan Management
* Investment Services
* Multi-language Support
