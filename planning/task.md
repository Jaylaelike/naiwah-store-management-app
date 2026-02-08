# NAIWAH Store Management System - Task List

## Phase 1: Foundation (Completed)
- [x] Analyze CSV data (`database_example.csv`, `user_db.csv`) <!-- id: 0 -->
- [x] Design ER Diagram & Schema <!-- id: 1 -->
- [x] Create `schema.prisma` with User, Device, DeviceImage, RepairHistory, TransferHistory models <!-- id: 2 -->

---

## Phase 2: Authentication & User Management
- [x] Implement Authentication (NextAuth v5) <!-- id: 3 -->
    - [x] Install dependencies (`next-auth@beta`, `bcryptjs`, `@auth/prisma-adapter`) <!-- id: 6 -->
    - [x] Create `auth.ts` with CredentialsProvider and JWT strategy <!-- id: 7 -->
    - [x] Create `middleware.ts` for route protection <!-- id: 8 -->
    - [x] Extend NextAuth types for custom user fields (`types/next-auth.d.ts`) <!-- id: 9 -->
    - [x] Create login page (`/login`) with glassmorphism design <!-- id: 10 -->
    - [x] Seed users from `user_db.csv` with hashed passwords <!-- id: 11 -->
  - [x] Fix Prisma Adapter Issue
  - [x] Create seed script reading from CSV
  - [x] Run seed script and verify
    - [x] Add SessionProvider to root layout <!-- id: 12 -->

---

## Phase 3: UI Foundation
- [x] Setup shadcn/ui Components <!-- id: 13 -->
    - [x] Initialize shadcn/ui (`npx shadcn@latest init`) <!-- id: 14 -->
    - [x] Install core components (button, input, form, card, dialog, select, table, toast) <!-- id: 15 -->
    - [x] Configure Tailwind CSS theme with design tokens <!-- id: 16 -->
    - [x] Create dashboard layout with sidebar navigation <!-- id: 17 -->

---

## Phase 4: Core Features
- [x] Device Inventory Management <!-- id: 18 -->
    - [x] Device list page with data table <!-- id: 19 -->
    - [x] Device detail page with images <!-- id: 20 -->
    - [x] Add/Edit device form with validation <!-- id: 21 -->
    - [x] QR code generation for each device <!-- id: 22 -->
    - [x] QR code scanner for device lookup <!-- id: 23 -->
    - [x] CIA (Asset Importance) Dashboard <!-- id: 59 -->
        - [x] Schema Update (C, I, A, HostID) <!-- id: 60 -->
        - [x] Backend Updates (Device Actions) <!-- id: 61 -->
        - [x] CIA Dashboard Page & Table <!-- id: 62 -->

- [x] PDF Export Feature <!-- id: 63 -->
    - [x] Install `html2canvas`, `jspdf`.
    - [x] Create `PdfExportButton` component.
    - [x] Implement Formal Report Layout in `DeviceDetailPage`.

- [x] Image Management (PocketBase) <!-- id: 24 -->
    - [x] PocketBase client setup <!-- id: 25 -->
    - [x] Multi-image upload component <!-- id: 26 -->
    - [x] Image gallery display <!-- id: 27 -->

- [x] History & Audit Trails <!-- id: 28 -->
    - [x] Repair history log with user tracking <!-- id: 29 -->
    - [x] Transfer history log with location changes <!-- id: 30 -->
    - [x] Audit trail display on device detail page <!-- id: 31 -->

- [x] Email Notifications
    - [x] Setup `nodemailer` service (`lib/email.ts`)
    - [x] Integrate with Repair History (`logRepair`)
    - [x] Implement Email for Approved Requests (`approveRequest`)

---


---

## Phase 5: Admin Features
- [x] Admin Dashboard <!-- id: 32 -->
    - [x] Statistics overview (total devices, active, repairs) <!-- id: 33 -->
    - [x] User management (Admin only) <!-- id: 34 -->
    - [x] Reporting and export features <!-- id: 35 -->

---

## Phase 6: Approval Workflow
- [x] Audit Log for Device Updates <!-- id: 55 -->
    - [x] Schema Update (`DeviceAuditLog` model) <!-- id: 56 -->
    - [x] Action Update (`updateDevice` to log changes) <!-- id: 57 -->
    - [x] History UI Update (`getDeviceHistory`) <!-- id: 58 -->
- [x] Schema Update (`ApprovalRequest` model) <!-- id: 44 -->
- [x] Refactor Device Actions (Create/Update/Delete) <!-- id: 45 -->
    - [x] Handle "Pending" state or Request creation <!-- id: 46 -->
- [x] Admin Approval Dashboard (`/dashboard/admin/approvals`) <!-- id: 47 -->
- [x] User Request Status View (`/dashboard/requests`) <!-- id: 48 -->
    - [x] Optimize “/dashboard/requests” list
- [x] Notification System (`/dashboard`) <!-- id: 50 -->
    - [x] Schema Update (`Notification` model) <!-- id: 51 -->
    - [x] Notification API (Get/Mark Read) <!-- id: 52 -->
    - [x] UI Component (`NotificationPopover`) <!-- id: 53 -->
    - [x] Event Triggers (Approval Workflow) <!-- id: 54 -->

---

## Phase 7: Verification & Deployment
- [ ] Testing <!-- id: 36 -->
    - [ ] Validate Prisma schema (`npx prisma validate`) <!-- id: 37 -->
    - [ ] Test authentication flow (login/logout) <!-- id: 38 -->
    - [ ] Test role-based access control <!-- id: 39 -->
    - [ ] Test device CRUD operations <!-- id: 40 -->

- [ ] Documentation <!-- id: 41 -->
    - [ ] API documentation <!-- id: 42 -->
    - [ ] User guide <!-- id: 43 -->
