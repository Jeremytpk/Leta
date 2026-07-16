# Leta Technologies LLC Enterprise Portal

Leta Technologies LLC is a comprehensive, zero-trust Enterprise Resource Planning (ERP) platform, Branch Network Coordinator, Technician Service Ticket Dispatcher, Live Staff Chat Portal, and Georgia State Tax Payroll Ledger System. 

Designed for high-density regional coordination, this system coordinates headquarters dispatchers, local branch managers, and onsite field technicians throughout Georgia, ensuring pristine transaction integrity and automated operational oversight.

---

## 🌟 Key Modules & System Features

### 1. Georgia Regional Tracking Evolutions (Dashboard)
Integrated directly with the central operations feed, the interactive trend panel provides four high-fidelity graphic visualization perspectives designed with **Recharts**:
*   **GA State Taxes (Area Chart)**: Tracks the flat **5.39% Georgia state income tax withholding** retained for company payroll accounts under current state tax guidelines.
*   **Tickets Activity (Line Chart)**: Plots completed onsite technician jobs against the remaining active dispatch queue.
*   **Contact Inflows (Bar Chart)**: Visualizes inbound lead volume and public message frequency routing from the online portal.
*   **Operational Hub (Composed Chart)**: Superimposes field workloads, active crew sizes, and base communication inflows to assess regional branch density in real-time.

### 2. Inquiry Manager & CRM Dispatch
Manages prospective customer and public dispatch service inquiries with live data synchronization:
*   **Live Notifications**: Stays synchronized with real-time Firestore triggers, highlighting unread messages.
*   **One-Click Response Deep-Linking**: Generates pre-populated outbound composition paths. Supports deep links to mail clients (such as **Zoho Mail** layouts with custom queries: `https://mail.zoho.com/zm/#mail/compose/to=...` or standard handlers).
*   **Safe Deletion Guard**: Ensures security through dual-confirmation modals before permanently removing message records from Firestore.

### 3. Service Ticket & Work Order Dispatch
*   **Assigned Pipelines**: Distributes tickets to local regional technicians. Technicians update statuses, log labor hours, and post work comments.
*   **Terminal State Locking**: Under strict zero-trust rules, once a service ticket transitions to `'completed'`, its parameters (descriptions, hours, client data) are frozen to prevent historical tampering.

### 4. Georgia State Tax Payroll & Ledger
*   **Automated Payroll Calculations**: Automatically monitors logged hours, hourly wage rates, and applies state tax models.
*   **State Tax Withholding**: Retains 5.39% flat Georgia state tax withholdings.
*   **Paystub Gatekeeping**: Direct gross salary accumulated and net payouts are securely generated, held in a `'pending'` queue, and released upon super-administrator signature.

### 5. Live Internal Staff Chat
*   **Regional Coordination Rooms**: Facilitates real-time communication between dispatch coordinators and active shift crews.
*   **Real-time Alerts**: Promotes operational reactivity through silent notification counters and unread badge alerts.

---

## 🔒 Zero-Trust Security Profile

Leta Technologies operates under a zero-trust architecture enforced through comprehensive Firestore security rules (`firestore.rules`). The system actively guards against:
1.  **Admin Claim Hijacking**: Prevents technicians from elevating their roles to administrator.
2.  **Orphaned Writes**: Validates reference integrity across comments, tickets, and employees.
3.  **Spoofing Ownership**: Locks down chat message identity to match the user's authenticated session.
4.  **Zero Hour Fraud**: Imposes temporal constraints on logged durations and enforces automatic server timestamps (`request.time`).
5.  **Role Isolation**: Isolates sensitive business models (paystubs, branch configurations, corporate rosters) to administrator accounts.

---

## 🛠️ Technology Stack

*   **Framework**: React (v18+) with Vite
*   **Language**: TypeScript
*   **Styling & Design System**: Tailwind CSS, Lucide Icons, Space Grotesk / Inter Typography
*   **Persistence & Database**: Google Firebase Firestore (NoSQL Document Store)
*   **Authentication**: Google Firebase Authentication (Cryptographic Password Hashing)
*   **Analytics**: Recharts Engine

---

## 🚀 Getting Started

### 1. Environment Variables Configuration
Configure a `.env` file at the project root based on `.env.example`:

```env
# Required for backend database connection & authentication
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"

# Optional: SMTP Mail Server Credentials (fallback to safe simulation logging if omitted)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@leta-tech.com"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Running the Platform
*   **Development Server**: Launch on port `3000`
    ```bash
    npm run dev
    ```
*   **Production Build**: Compile static files to `dist/` and server assets
    ```bash
    npm run build
    ```
*   **Production Start**: Execute the production instance
    ```bash
    npm run start
    ```
