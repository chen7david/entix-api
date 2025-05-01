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

![ERD Diagram](https://raw.githubusercontent.com/chen7david/entix-api/3f691f8ec4fb5889946f5630190a5222f875a433/docs/assets/erd-multi-tenancy-rbac.svg)

---

## 🚀 Implementation Plan

Based on the current codebase and best practices, here is a step-by-step implementation plan:

1. **Schema Validation:**

   - Ensure all tables (`USERS`, `TENANTS`, `ROLES`, `PERMISSIONS`, `USER_ROLES`, `ROLE_PERMISSIONS`, `USER_TENANTS`) exist and have the correct fields and relationships as per the ERD.
   - Add database constraints to enforce tenant scoping and referential integrity.

2. **Backend Logic:**

   - Update authentication logic to require and validate `tenant_id` on login/session creation.
   - Refactor all role and permission queries to include tenant scoping (e.g., always filter by `tenant_id` where relevant).
   - Implement caching for user permissions per tenant (e.g., using Redis), invalidating cache on role/permission changes.

3. **API Design:**

   - All endpoints that mutate or read tenant-scoped data must require a valid `tenant_id` in the request context.
   - Add middleware to enforce tenant context and permission checks for all protected routes.

4. **Testing:**

   - Write unit and integration tests to verify tenant isolation, correct permission assignment, and access control enforcement.
   - Test edge cases, such as users belonging to multiple tenants with different roles.

5. **Documentation:**

   - Keep this documentation up to date with any schema or logic changes.
   - Document API endpoints and expected tenant context requirements for consumers.

6. **Operational Best Practices:**
   - Standardize permission naming conventions globally to avoid ambiguity.
   - Monitor logs for role/permission mismatches and potential cross-tenant access attempts.

---

For further details or updates, refer to this document and the ERD above. This approach ensures robust, scalable, and secure multi-tenant RBAC for your SaaS platform.
