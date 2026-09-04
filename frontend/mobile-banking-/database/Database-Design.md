# Mobile Banking Database Design

## Overview

The Mobile Banking Application uses a MySQL relational database to securely manage users, bank accounts, transactions, beneficiaries, notifications, OTP verification, and login history. The database is normalized to reduce redundancy and maintain data integrity using primary and foreign key relationships.

---

# Database Name

```
mobile_banking_db
```

---

# Tables

The database consists of the following tables:

1. users
2. accounts
3. transactions
4. beneficiaries
5. notifications
6. otp_verification
7. login_history

---

# Table Details

## 1. users

### Purpose

Stores the personal information of every registered user.

### Columns

| Column | Type | Description |
|----------|------|-------------|
| user_id | INT | Primary Key |
| full_name | VARCHAR | Customer Name |
| email | VARCHAR | Email Address |
| phone | VARCHAR | Mobile Number |
| password | VARCHAR | Encrypted Password |
| address | TEXT | Residential Address |
| created_at | TIMESTAMP | Registration Time |

### Primary Key

```
user_id
```

---

## 2. accounts

### Purpose

Stores bank account information for each registered user.

### Columns

| Column | Type |
|----------|------|
| account_id | INT |
| user_id | INT |
| account_number | VARCHAR |
| account_type | VARCHAR |
| balance | DECIMAL |
| status | VARCHAR |
| created_at | TIMESTAMP |

### Primary Key

```
account_id
```

### Foreign Key

```
user_id → users(user_id)
```

---

## 3. transactions

### Purpose

Stores all money transfer records.

### Columns

| Column | Type |
|----------|------|
| transaction_id | INT |
| sender_account | INT |
| receiver_account | INT |
| amount | DECIMAL |
| transaction_type | VARCHAR |
| transaction_status | VARCHAR |
| transaction_date | TIMESTAMP |

### Primary Key

```
transaction_id
```

### Foreign Keys

```
sender_account → accounts(account_id)

receiver_account → accounts(account_id)
```

---

## 4. beneficiaries

### Purpose

Stores beneficiary accounts added by users.

### Columns

| Column | Type |
|----------|------|
| beneficiary_id | INT |
| user_id | INT |
| beneficiary_name | VARCHAR |
| beneficiary_account | VARCHAR |
| bank_name | VARCHAR |
| ifsc_code | VARCHAR |
| created_at | TIMESTAMP |

### Primary Key

```
beneficiary_id
```

### Foreign Key

```
user_id → users(user_id)
```

---

## 5. notifications

### Purpose

Stores notifications sent to users.

### Columns

| Column | Type |
|----------|------|
| notification_id | INT |
| user_id | INT |
| message | TEXT |
| status | VARCHAR |
| created_at | TIMESTAMP |

### Primary Key

```
notification_id
```

### Foreign Key

```
user_id → users(user_id)
```

---

## 6. otp_verification

### Purpose

Stores OTP codes used during authentication.

### Columns

| Column | Type |
|----------|------|
| otp_id | INT |
| user_id | INT |
| otp_code | VARCHAR |
| expiry_time | TIMESTAMP |
| status | VARCHAR |

### Primary Key

```
otp_id
```

### Foreign Key

```
user_id → users(user_id)
```

---

## 7. login_history

### Purpose

Maintains login activity of users.

### Columns

| Column | Type |
|----------|------|
| login_id | INT |
| user_id | INT |
| login_time | TIMESTAMP |
| ip_address | VARCHAR |
| device | VARCHAR |

### Primary Key

```
login_id
```

### Foreign Key

```
user_id → users(user_id)
```

---

# Relationships

```
users
│
├── accounts
│
├── beneficiaries
│
├── notifications
│
├── otp_verification
│
└── login_history

accounts
│
└── transactions
```

---

# Features Supported

- User Registration
- Secure Login
- OTP Verification
- Account Management
- Money Transfer
- Beneficiary Management
- Transaction History
- Notifications
- Login Tracking

---

# Future Enhancements

- Fixed Deposit Module
- Loan Management
- UPI Integration
- Credit Card Services
- AI Fraud Detection
- Audit Logs

---

# Conclusion

This database is designed using normalization principles and relational integrity to provide a secure, scalable, and efficient backend for the Mobile Banking Application.