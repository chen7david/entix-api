# Multi-Tenant RBAC System

This document details the architecture and implementation plan for a **multi-tenant, role-based access control (RBAC)** system, designed for scalable and secure SaaS applications.

---

## 📦 System Overview

A multi-tenant architecture allows multiple customers (tenants) to use the same application and database instance. RBAC manages access at the role and permission level **within each tenant**, ensuring:

- Strict isolation of roles and permissions per tenant
- Reuse of a global permissions catalog
- Simplicity and performance in authorization

---

## 🛡️ Multi-Tenancy Enforcement

Multi-tenancy is enforced through the following mechanisms:

- **Tenant ID Scoping:** All key user-role-permission relationships are explicitly tied to a `tenant_id`.
- **Shared Users, Isolated Roles:** A single user can belong to multiple tenants, but roles are created per tenant and are not shared globally.
- **Tenant Context in Sessions:** At login, the selected `tenant_id` is included in the session context. All authorization checks are performed within this tenant context.
- **Scoped Queries and Access Checks:** When performing actions, the backend checks both the user's role within the specific tenant and the permissions mapped to those roles.

---

## 🎯 Role & Permission Isolation

- **Roles are Tenant-Scoped:** Each tenant can define roles (e.g., `admin`, `viewer`) with the same name as other tenants, but these are distinct entries in the `ROLES` table and mapped to different permissions.
- **Permissions are Global:** Permissions (e.g., `read:user`, `edit:project`) are defined globally and reused across tenants. Access to these permissions is only granted through tenant-scoped roles.
- **Strict Contextual Access:** A user's role and permissions in Tenant A do not affect their access in Tenant B.

---

## 🌍 Global vs Tenant-Scoped Entities

| Entity           | Scope    | Reason                                                              |
| ---------------- | -------- | ------------------------------------------------------------------- |
| USERS            | Global   | Users can belong to multiple tenants. Avoids duplication.           |
| TENANTS          | Global   | Core identity of the tenant (company/org).                          |
| PERMISSIONS      | Global   | Reusable set of standardized permissions across all tenants.        |
| ROLES            | Tenant   | Each tenant defines roles and maps them to permissions.             |
| USER_ROLES       | Tenant   | Explicit `tenant_id` scopes user-role association.                  |
| USER_TENANTS     | Tenant   | Tracks tenant membership for each user.                             |
| ROLE_PERMISSIONS | Tenant\* | Mappings are scoped indirectly by `role_id`, which is tenant-bound. |

---

## 🧠 Authorization Logic

1. **User Login:** User logs in and selects a `tenant_id`.
2. **Role Fetch:** System fetches all `roles` that the user has **in that tenant** via `USER_ROLES`.
3. **Permission Fetch:** From those roles, the system fetches associated `permissions` via `ROLE_PERMISSIONS`.
4. **Caching:** Permissions are cached for performance (e.g., in Redis).
5. **Authorization:** Requests are authorized by checking whether the user has a specific permission in the current tenant context.

---

## ✅ Pros

- Clear isolation of permissions and roles per tenant
- Reusability of permission definitions
- Scalable to many tenants with minimal duplication
- Flexible access control, supporting multi-tenant users with distinct roles per context

## ❌ Cons

- Slightly higher complexity in queries due to tenant scoping
- Duplicate role names across tenants can create confusion in logs/debugging
- Global permissions require careful naming and standardization to ensure clarity

---

## 🧩 Entity Relationship Diagram (ERD)

The following ERD illustrates the schema for the multi-tenant RBAC system:

![ERD Diagram](https://raw.githubusercontent.com/chen7david/entix-api/be10ca326be50b091e9e23cf445d96bf381214d8/docs/assets/erd-multi-tenancy-rbac.svg)

---

For further details or updates, refer to this document and the ERD above. This approach ensures robust, scalable, and secure multi-tenant RBAC for your SaaS platform.
