# AICTE Smart FDR Command Centre

### A Smart Automation Prototype for Fixed Deposit Receipt (FDR) Management

A responsive web application prototype designed to streamline the monitoring and management of Fixed Deposit Receipts (FDRs), security deposits, verification workflows, maturity tracking, and release/refund requests for AICTE-related institutional processes.

**[Live Demo](https://aicte-smart-fdr-centre.vercel.app)**

> **Disclaimer:** This is a demonstration prototype built with fictional sample data. It is not an official AICTE application and does not connect to live AICTE systems, banks, or financial services. All workflows and automation are simulated.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Smart Automation](#smart-automation)
- [Technology Stack](#technology-stack)
- [Application Workflow](#application-workflow)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Limitations](#limitations)
- [Future Scope](#future-scope)

---

## Overview

The AICTE Smart FDR Command Centre is a frontend-focused prototype that demonstrates how Fixed Deposit Receipt management could be organized through a centralized digital interface.

It brings together FDR records, institutional information, verification activities, maturity and renewal monitoring, release/refund requests, reporting, and audit trails.

The application emphasizes **workflow visibility, rule-based automation, and responsive design** to demonstrate how administrative processes could become easier to monitor and manage.

## Problem Statement

Managing institutional security deposits and FDRs can involve multiple records, verification stages, maturity deadlines, renewal activities, and release/refund processes.

A centralized command centre can help demonstrate a more organized approach by providing:

- A consolidated view of FDR records and institutional deposits.
- Visibility into verification and approval workflow stages.
- Maturity monitoring and renewal reminders.
- Structured release/refund request tracking.
- Reporting and audit-trail visibility.
- Role-based interfaces for different categories of users.

## Key Features

### 1. FDR Repository
- Centralized view of FDR records.
- Instrument, institution, bank, and deposit information.
- Record details and linked replacement FDR information.

### 2. Institution Directory
- Institutional record management.
- Institution-level information and associated FDR records.

### 3. Verification Centre
- Organized view of FDR verification activities.
- Workflow status visibility for submitted records.

### 4. Smart Automation Centre
- Rule-based alerts and workflow assistance.
- Identification of records requiring attention.
- Simulated automation for administrative monitoring.

### 5. Maturity & Renewal Tracker
- Maturity dates and countdowns.
- Identification of overdue and upcoming maturities.
- Renewal pipeline visibility.
- Replacement FDR tracking.

### 6. Release & Refund Management
- Release/refund request tracking.
- Request category and submission information.
- Workflow status and request details.

### 7. Reports & Analytics
- FDR inventory breakdown.
- Deposit allocation summaries.
- Institutional and workflow reporting views.

### 8. Audit Trail
- Audit event history.
- Action codes, timestamps, operators, and target records.
- Visibility into simulated administrative activity.

### 9. User & Role Management
- Administrative, verification, and institutional roles.
- Role-based permissions matrix.
- Comparison of operational capabilities.

### 10. Responsive Interface
- Responsive layouts for different screen sizes.
- Horizontally scrollable data tables on narrow screens.
- Dedicated navigation and workflow views.

## User Roles

The prototype demonstrates three user roles:

| Role | Description |
|---|---|
| Bureau Administrator | Oversees records, workflows, reporting, and administrative functions. |
| Verification Officer | Reviews FDR information and verification workflows. |
| Institutional User | Represents an institution interacting with the FDR submission and tracking process. |

Role behavior and permissions are simulated within the prototype and should not be considered a production security system.

## Smart Automation

The Smart Automation Centre demonstrates how rule-based logic can assist with routine administrative monitoring.

Potential use cases include:

- Flagging upcoming FDR maturities.
- Highlighting overdue records.
- Identifying records that require follow-up.
- Improving visibility into renewal and verification workflows.
- Helping users prioritize pending administrative activities.

The current implementation uses simulated data and application-defined rules. It does not use live bank integrations or autonomous government decision-making.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| TypeScript | Type-safe application development |
| Vite | Development server and production build |
| Tailwind CSS | Interface styling and responsive layouts |
| Lucide React | Interface icons |
| Browser Local Storage | Persistence of demonstration data |

The application is designed as a frontend prototype. Refer to `package.json` for the exact dependency versions.

## Application Workflow

A typical demonstration workflow can include:

1. View the overview dashboard.
2. Explore institutional and FDR records.
3. Review verification workflow statuses.
4. Monitor upcoming and overdue FDR maturities.
5. Inspect renewal and replacement information.
6. Review release/refund requests.
7. Explore reports, permissions, and audit events.

The prototype uses sample records to demonstrate these interactions. It does not perform actual financial transactions or official approvals.

## Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — use a current compatible version.
- npm — included with Node.js.
- [Git](https://git-scm.com/) — for cloning the repository.

### 1. Clone the repository

```bash
git clone https://github.com/mmansii/FDR-Portal.git
cd FDR-Portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal, typically `http://localhost:3000/`.

### 4. Create a production build

```bash
npm run build
```

Vite generates the production build in the `dist/` directory.

## Project Structure

```text
FDR-Portal/
├── public/                         # Static assets
├── src/
│   ├── assets/                     # Application assets
│   ├── components/
│   │   ├── common/                 # Shared UI components
│   │   ├── layout/                 # Header, sidebar, disclaimer
│   │   └── modules/                # Application feature modules
│   │       ├── audit/
│   │       ├── automation/
│   │       ├── dashboard/
│   │       ├── institutions/
│   │       ├── maturity/
│   │       ├── release/
│   │       ├── reports/
│   │       ├── repository/
│   │       ├── settings/
│   │       ├── submission/
│   │       ├── users/
│   │       └── verification/
│   ├── context/                    # Application state
│   ├── data/                       # Initial demonstration data
│   ├── services/                   # Automation, storage, CSV export
│   ├── types/                      # TypeScript models
│   ├── utils/                      # Shared utility functions
│   ├── App.tsx                     # Main application
│   ├── App.css                     # Application styles
│   ├── index.css                   # Global styles
│   └── main.tsx                    # Application entry point
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## Limitations

This project is a prototype intended to demonstrate a possible workflow and user experience.

- All records are fictional demonstration data.
- Browser-based persistence is local to the user's browser.
- Data stored in one browser or device does not automatically synchronize with another.
- Authentication and role behavior are not a substitute for production-grade access control.
- There are no live AICTE, banking, or payment integrations.
- The application does not perform actual approvals, refunds, or financial transactions.
- The prototype is not intended for storing real financial or institutional information.

## Future Scope

Possible future improvements include:

- Secure backend APIs and database integration.
- Production-grade authentication and authorization.
- Verified integrations with authorized institutional systems.
- Secure document storage and verification workflows.
- Server-side notifications and scheduled maturity reminders.
- More advanced analytics and downloadable reports.
- Comprehensive automated testing and accessibility improvements.

Any production implementation would require appropriate security, privacy, validation, and authorization controls.

---

## Project Links

- **Live Demo:** https://aicte-smart-fdr-centre.vercel.app
- **GitHub Repository:** https://github.com/mmansii/FDR-Portal

---

**Built as a demonstration of smart automation for institutional FDR management.**