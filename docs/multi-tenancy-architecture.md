# Multi-Tenant RBAC System

This document outlines the structure and functioning of a **multi-tenant, role-based access control (RBAC)** system designed for a scalable, secure SaaS application.

---

## 📦 System Overview

In a multi-tenant architecture, multiple customers (tenants) use the same application and database instance. RBAC is used to manage access at the role and permission level **within each tenant**, ensuring:

- Isolation of roles and permissions per tenant
- Reuse of a global permissions catalog
- Simplicity and performance in authorization

---

## 🎯 Core Concepts

- **Tenant**: A logically isolated customer.
- **User**: An individual with login access, possibly across multiple tenants.
- **Role**: A named collection of permissions. Each role belongs to a single tenant.
- **Permission**: A reusable action or capability (e.g., `can_edit_invoice`).
- **UserRoles**: Assigns a user to a role in a specific tenant.
- **RolePermissions**: Assigns a permission to a role.

---

## 🧠 Authorization Logic

1. A user logs in and presents a `tenant_id`.
2. The system fetches all `roles` that the user has **in that tenant** via `UserRoles`.
3. From those roles, it fetches the associated `permissions` via `RolePermissions`.
4. These permissions are **cached** for performance (e.g., in Redis).
5. Requests are authorized by checking whether the user has a specific permission in the current tenant context.

---

## 🧩 Entity Relationship Diagram (ERD)

Here's the ERD in **Mermaid syntax**. GitHub and other Markdown tools that support Mermaid will render this as a diagram.
