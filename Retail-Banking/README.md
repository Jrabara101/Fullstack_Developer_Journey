# ApexBank: Trust-Engine Retail Banking Dashboard

> *"Designing a banking dashboard requires a fundamental shift in product psychology: you are not designing a data viewer; you are designing a trust engine."*

This repository implements an institutional-grade retail banking portal built around cognitive peace of mind, reduction of financial anxiety, zero-ambiguity ergonomics, and strategic positive friction.

---

## Core Product Psychology & Architectural Pillars

### 1. The Psychology of Financial Interfaces & Trust
- **The "Safe to Spend" Heuristic**:
  - Showing raw *Available Balance* ($14,850.42) induces anxiety because users mentally deduct upcoming bills and pending charges.
  - ApexBank's heuristic algorithmically deducts upcoming scheduled commitments ($2,440.42) over the next 14 days, presenting an immediate purchasing power of **$12,410.00**.
  - Includes an interactive breakdown modal displaying the exact mathematics.
- **Zero Ambiguity in Typography (`tabular-nums`)**:
  - Standard proportional numbers create spatial bias: `$1,111.00` takes up less physical width than `$8,888.00`, tricking the human brain into misjudging scale.
  - Enforces `font-variant-numeric: tabular-nums` and `font-feature-settings: "tnum"` universally across all ledgers, tables, balances, dates, and interest rates.
- **Strict Color Psychology**:
  - **Slate / Black (`#0f172a` / `#334155`)**: Standard neutral state for everyday debits and card outflows (`-$14.99`, `-$142.80`). Red is explicitly prohibited for standard expenses to avoid panic.
  - **Emerald (`#059669`)**: Strictly reserved for positive cash inflows (`+$4,250.00`, `+$187.32`).
  - **Amber (`#d97706`)**: Reserved for pending merchant holds and temporary authorizations.
  - **Crimson / Rose (`#dc2626`)**: Reserved exclusively for frozen card security states, overdraft alerts, and critical blocking actions.

---

### 2. Transaction Ledger Ergonomics
- **Merchant Cleaning vs. Raw Gateway Strings**:
  - Legacy payment gateways produce raw, unformatted strings: `ACH TRNSFR 09192 SQ* COFFEE`.
  - Modern low-friction approach cleans these into recognizable merchant avatars (`Square Coffee` with brand icon).
  - Includes a live toggle (**Clean Merchant** vs **Raw Gateway String**) demonstrating how cognitive recognition directly eliminates false fraud reports.
- **Designing the "Pending" State**:
  - Visual distinction using a **dashed amber border** (`border-dashed border-amber-300 bg-amber-50/40`) and italicized timestamp (`Today, 1:15 PM`).
  - Interactive tooltip explaining: *"This merchant has placed a temporary pre-authorization hold. The final amount may change when the transaction clears."*
- **Inflow vs Outflow Scannability**:
  - Clean columnar alignment with instant filter tabs (`All`, `Inflows (+)`, `Outflows (-)`, `Pending`) and live substring search.

---

### 3. Analytics & Personal Financial Management (PFM)
- **Actionable Insights over Basic Categorization**:
  - Instead of standard static pie charts ("You spent 40% on Food"), the interface synthesizes proactive guidance:
    > *"Your dining expenses are 15% higher than your monthly average ($345 vs $300). You have $200 left in your discretionary dining budget for the next 8 days."*
- **Forward-Looking Cash Flow (Next 14 Days)**:
  - Backward-looking charts show what you already spent; forward-looking widgets eliminate cash anxiety before bills clear.
  - Interactive SVG trajectory curve visualizing the projected daily balance trajectory, highlighting upcoming subscriptions (Amazon Prime), insurance (MetLife), telecom (Verizon), payroll spike, and residential rent.

---

### 4. Security & "Positive Friction"
- **Speed Bumps for High-Risk Actions**:
  - In commerce, friction is minimized; in banking, strategic friction reinforces confidence and eliminates accidental wire panic.
  - For transfers exceeding $500, the "Send Money" modal engages an interactive **"Slide to Confirm Transfer"** track that requires a deliberate 100% drag gesture before execution.
- **Instant Auditability**:
  - Every high-level transfer or security action triggers a persistent, high-contrast **Audit Toast Notification** detailing transaction reference IDs (`Ref #TX-89210`), timestamps, and delivery channel receipts.

---

### 5. Business KPIs for Dashboard Success
The top telemetry banner displays real-time benchmarks:
1. **Self-Service Resolution Rate (94.2%)**: Users resolving lost card locks and charge disputes self-sufficiently without contacting telephony support.
2. **Daily Active Habit (88.4% DAU)**: Users logging in frequently with low friction simply to check balances with complete peace of mind.
3. **Transfer Abandonment Rate (1.1%)**: Measuring minimal friction in money movement with reassuring speed bump UI.

---

## File Structure

```
Retail-Banking/
├── index.html                                        # Standalone production web application
├── README.md                                         # Architecture and psychological doctrine
└── stitch_retail_banking_dashboard/
    ├── modern_retail_banking/
    │   └── DESIGN.md                                 # Material & Slate design tokens
    ├── apexbank_logo/
    │   ├── code.html                                 # SVG logo definition
    │   └── screen.png
    └── retail_banking_dashboard/
        ├── code.html                                 # Synchronized dashboard template
        └── screen.png
```

## Running Locally

Simply open `index.html` in any modern web browser or serve it via any static web server:

```powershell
# Using Python
python -m http.server 3000

# Or open directly in your browser:
start index.html
```
