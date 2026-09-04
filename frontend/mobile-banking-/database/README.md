# Database Module

## Overview

This folder contains all database-related files for the Mobile Banking Application.

The project uses **MySQL 8.0** as the relational database management system.

---

## Contents

| File | Description |
|------|-------------|
| schema.sql | Contains the complete database schema including all CREATE TABLE statements. |
| sample-data.sql | Contains dummy records for testing the application. |
| Database-Design.md | Documentation explaining the database structure and relationships. |
| README.md | Documentation for the database module. |

---

## Database Name

```
mobile_banking_db
```

---

## Tables

- users
- accounts
- transactions
- beneficiaries
- notifications
- otp_verification
- login_history

---

## Features

- User Registration
- Account Management
- Money Transfer
- Transaction History
- OTP Verification
- Beneficiary Management
- Notifications
- Login History

---

## Technologies Used

- MySQL 8.0
- SQL
- MySQL Workbench

---

## How to Run

### Step 1

Create the database.

```sql
CREATE DATABASE mobile_banking_db;
```

### Step 2

Select the database.

```sql
USE mobile_banking_db;
```

### Step 3

Execute:

```
schema.sql
```

### Step 4

Execute:

```
sample-data.sql
```

---

## Project Structure

```
database/
│
├── schema.sql
├── sample-data.sql
├── Database-Design.md
└── README.md
```

---

## Status

✅ Database Schema Completed

✅ Sample Data Added

✅ Documentation Completed

---

Developed as part of the Mobile Banking DevOps Project.