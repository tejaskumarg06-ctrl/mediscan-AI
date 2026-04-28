# MediScan AI Security Specification

## Data Invariants
- A `DiagnosticScan` must always belong to a valid user.
- Users can only read and write their own profile and scans.
- `userId` field in any scan must match the `request.auth.uid`.
- Timestamp fields must rely on server time.
- Diagnostic fields (results, confidence) have strict type and size constraints.

## "The Dirty Dozen" Payloads (Targets for Rejection)
1. **Identity Spoofing**: Attempt to create a scan for `victim_user_id` while authenticated as `attacker_user_id`.
2. **Resource Poisoning**: Injecting a 2MB base64 string into a non-image field.
3. **State Shortcutting**: Manually setting `severity: "low"` for a critical condition by bypassing the diagnostic engine.
4. **Illegal ID**: Attempting to use path segments like `../` or `%20` in document IDs.
5. **PII Leak**: Authenticated user trying to list all `UserProfile` documents.
6. **Future Dating**: Setting `timestamp` to `2030-01-01`.
7. **Type Mismatch**: Sending `confidenceScore: "very high"` (string) instead of a number.
8. **Shadow Field**: Adding `isAdmin: true` to a UserProfile.
9. **Bulk Deletion**: Attempting to delete multiple scans in a batch without ownership.
10. **Query Injection**: Listing scans where `userId != request.auth.uid`.
11. **Update Hijacking**: Modifying the `type` or `timestamp` of an existing scan.
12. **Anonymous Write**: Attempting to save a scan without being signed in.

## Test Runner (firestore.rules.test.ts)
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc, getDocs, collection, query, where } from 'firebase/firestore';

// Mock runner for validation
// ... would contain standard testing logic for the dirty dozen
```
