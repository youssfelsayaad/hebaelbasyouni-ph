# Security Specification & Red-Team Audit

## 1. Data Invariants
1. **Admin-Only Portfolio Mutations**: Only verified Admin users (`request.auth.token.email_verified == true` and matching bootstrapped admin email or `/adminEmails/{email}`) may create, update, or delete `/sessions/{sessionId}` or `/siteSettings/{settingId}`.
2. **Strict Schema Enforcement**: Every write to `/sessions`, `/siteSettings`, `/adminEmails`, and `/bookingInquiries` validates exact keys (`hasAll` + `hasOnly`), string `.size()` boundaries, enum values, and server-side timestamps (`request.time`).
3. **Immutable Ownership & Creation Timestamps**: `createdAt` and `authorUid` on `/sessions/{sessionId}` cannot be altered after creation.
4. **PII Isolation on Inquiries**: `/bookingInquiries/{inquiryId}` accepts validated new inquiries with `status == 'new'`, while `get`, `list`, `update`, and `delete` are strictly locked to verified Admins (`isAdmin()`) so visitor phone numbers and notes are never exposed.
5. **No Privilege Escalation**: `/adminEmails/{emailId}` is strictly readable and writable only by existing verified Admins (`isAdmin()`).

## 2. Dirty Dozen Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated `create` on `/sessions/hack-1`.
2. Authenticated non-admin `create` on `/sessions/hack-2`.
3. Unverified email admin token (`email_verified: false`) attempting `update` on `/siteSettings/profile`.
4. Shadow field injection (`isAdmin: true`) during `create` on `/sessions/hack-3`.
5. Oversized `coverImage` (> 600,000 chars) on `/sessions/hack-4`.
6. Invalid `mediaType: "audio"` on `/sessions/hack-5`.
7. Spoofed `authorUid` (`authorUid: "someone-else"`) on `/sessions/hack-6`.
8. Client-spoofed `createdAt` (past timestamp instead of `request.time`) on `/sessions/hack-7`.
9. Oversized path ID (`150` chars) on `/sessions/{longId}`.
10. Non-admin `list` or `get` on `/bookingInquiries` (PII exfiltration attempt).
11. Inquiry `create` trying to set `status: "booked"` instead of `"new"`.
12. Non-admin trying to add themselves to `/adminEmails/attacker@evil.com`.
