# Operational Runbook

This document contains procedures for common operational tasks: backups, restores, migrations, and releases.

## Backup Procedure

**Purpose:** Periodic backup of application data for disaster recovery.

### Automated Backups (Recommended)
Daily backup via cron job or cloud function:

```bash
# Node.js script or cloud function
import { createStorageProvider } from '@/src/infrastructure/storage/server'
import fs from 'fs'

async function backupDaily() {
  const provider = await createStorageProvider({ engine: 'sqlite' })
  const backup = await provider.exportAll()
  
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `backup-${timestamp}.json`
  
  fs.writeFileSync(`/backups/${filename}`, JSON.stringify(backup, null, 2))
  
  // Upload to S3/cloud storage
  // ...
  
  await provider.close()
}
```

### Manual Backup
To manually backup data:

```bash
# Via UI (when implemented):
# Settings → Backup → Download Backup

# Via script:
npm run backup  # (to be added)
```

### Backup Verification
After backup, verify:
1. File size is reasonable (hundreds of KB to few MB, depending on data volume)
2. File contains `format: 'pos.storage.export'` and `entities` array
3. Timestamp is recent

---

## Restore Procedure

**Purpose:** Restore data from a previous backup in case of data loss.

### Via UI (When Implemented)
```
Settings → Restore → Upload Backup File
```

### Via Script
```bash
npm run migrate:engine -- --from memory --to sqlite --backup-file backups/backup-2024-07-20.json
```

### Restore Verification

After restore:

```bash
# Verify row counts match original backup
npm run migrate:engine -- --verify-only --backup-file backups/backup-2024-07-20.json

# Expected output:
# ✓ organizations: 5 rows, digest abc123...
# ✓ users: 12 rows, digest def456...
# ... (all collections)
# ✓ Migration successful! All checksums match.
```

**If verification fails:**
1. Check that the backup file is valid JSON and contains `entities`
2. Verify data wasn't corrupted during transit
3. Attempt restore on a test instance first

---

## Storage Engine Migration Drill

**Purpose:** Demonstrate that data can be moved between storage engines without loss.

### Scenario: Memory → SQLite

1. **Seed test data:**
   ```bash
   # Create test data via UI or seeder script
   npm run seed:test
   ```

2. **Export from memory:**
   ```bash
   STORAGE_ENGINE=memory npm run migrate:engine -- \
     --from memory --to sqlite --verify-only
   
   # Note row counts:
   # organizations: 5 rows
   # users: 12 rows
   # ...
   ```

3. **Perform full migration:**
   ```bash
   npm run migrate:engine -- --from memory --to sqlite
   
   # Expected:
   # 1. Opening source engine (memory)...
   # 2. Exporting data...
   # 3. Computing checksums on source...
   # 4. Opening target engine (sqlite)...
   # 5. Importing data...
   # 6. Verifying by re-exporting from target...
   # 7. Computing checksums on target...
   #
   # ✓ Migration successful! All checksums match.
   ```

4. **Verify SQLite contains the data:**
   ```bash
   # Start app with SQLite engine
   STORAGE_ENGINE=sqlite npm run dev
   
   # Via UI: Verify all data (organizations, users, etc.) appears
   # Via logs: Should see no data errors
   ```

### Scenario: SQLite → Memory (Reverse)

```bash
npm run migrate:engine -- --from sqlite --to memory
```

Use this to test that data survives round-trip.

### Checksum Validation

The migration script automatically validates checksums. If they don't match:

```
❌ Verification failed:
   organizations: row count source=5 vs target=6
   users: digest source=abc123... vs target=def456...
```

**Troubleshooting:**
- Ensure no external process is modifying data during migration
- Check that both engines are properly initialized
- Verify the export format is valid

---

## Release Procedure

### Semver Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., `1.2.3`)
- Increment MAJOR for breaking changes
- Increment MINOR for new features (backwards compatible)
- Increment PATCH for bug fixes

### Steps to Release

#### 1. Update Version
```bash
# Update version in package.json
# Current: "version": "0.1.0"
# New: "version": "0.2.0"  (example for minor bump)
```

#### 2. Update CHANGELOG
Create `CHANGELOG.md` if it doesn't exist:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-07-20

### Added
- SQLite storage adapter for server-side persistence
- Engine migration script for data portability
- Launch checklist and operational runbook

### Fixed
- Storage conformance suite now includes all three adapters

### Changed
- Reorganized storage adapter guide to document server-only pattern
```

#### 3. Test the Build
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

#### 4. Create Git Tag
```bash
git add package.json CHANGELOG.md docs/
git commit -m "Release v0.2.0"
git tag -a v0.2.0 -m "Version 0.2.0: SQLite adapter + operational docs"
git push origin main --tags
```

#### 5. Deploy
```bash
# Deploy to production environment
# (exact command depends on hosting provider)
npm run build
npm run start

# Or via container:
docker build -t pos:0.2.0 .
docker push registry/pos:0.2.0
kubectl set image deployment/pos pos=registry/pos:0.2.0
```

#### 6. Smoke Test
After deployment:
1. Verify app loads and is responsive
2. Check error logs for issues
3. Run quick user flow test (login → create sale → checkout)
4. Monitor metrics (Sentry, uptime monitors, etc.) for 30 minutes

---

## Rollback Procedure

**When to rollback:** Critical bug or data corruption discovered in production.

### Via Git Tag

```bash
# List recent releases
git tag | tail -10

# Checkout previous stable version
git checkout v0.1.0

# Rebuild and redeploy
npm run build
npm run start
```

### Data Considerations

**Good news:** Rollback only affects the application code, not stored data.

- **IndexedDB data** (browser): Persists across rollbacks. The old app version will continue using the same IndexedDB instance.
- **SQLite data** (server): Also persists. The new (rolled-back) app version can read it without issue.

**Potential issue:** If the new version includes schema changes, rolling back to old code might encounter schema version mismatches.

**How to handle schema mismatches:**
The `SchemaVersioner` includes a `migrateTo()` method with support for downgrade paths:

```typescript
// In schema-versioner.ts (existing)
async migrateTo(targetVersion: number) {
  const current = await this.driver.getSchemaVersion()
  
  if (targetVersion < current) {
    // Downgrade path: apply inverse migrations
    // Already handled by existing schemaSteps
  } else {
    // Upgrade path: apply forward migrations
  }
}
```

After rollback, the app will automatically detect the newer schema and apply downgrade steps (if defined). If downgrade steps don't exist, the old app version will use existing data as-is.

### Complete Rollback Example

```bash
# 1. Detect issue in production (e.g., v0.2.0 fails)
# 2. Checkout previous version
git checkout v0.1.0

# 3. Redeploy
npm run build
npm start  # or deploy to cloud

# 4. Verify old app works with existing data
# - IndexedDB browser data: still accessible
# - SQLite server data: still accessible
# - Schema version: downgrade path handles it

# 5. Investigate issue in v0.2.0
git checkout v0.2.0
# Fix bug, test locally, re-release as v0.2.1
```

---

## Disaster Recovery Drill

**Frequency:** Monthly

**Goal:** Confirm backup/restore procedure works end-to-end.

### Steps

1. **Create backup snapshot:**
   ```bash
   npm run backup  # Captures current state
   ```

2. **Simulate data loss:**
   ```bash
   # In test environment only:
   rm -f .data/pos.db  # Delete SQLite database
   # Or clear IndexedDB in browser DevTools
   ```

3. **Restore from backup:**
   ```bash
   npm run restore -- --file backup-snapshot.json
   ```

4. **Verify all data restored:**
   - Check row counts match original
   - Verify checksums match (done automatically by restore script)
   - Run smoke tests

5. **Document results:**
   - Record any issues or delays
   - Update this runbook if procedure changes
   - Notify team of completion

**Success criteria:**
- Restore completes without errors
- All row counts match
- Checksums validate
- Smoke tests pass
- Time to restore < 5 minutes

---

## Health Checks & Monitoring

### Daily

- [ ] Sentry dashboard: 0 critical errors
- [ ] Uptime monitor: > 99.9% availability
- [ ] Error rate: < 0.1%

### Weekly

- [ ] Backup succeeded (file exists, recent timestamp)
- [ ] Storage audit: Run `npm run audit` locally, review any high-risk packages
- [ ] Conformance suite: `npm run test:conformance:node` still green

### Monthly

- [ ] Full disaster recovery drill (see above)
- [ ] Review and update this runbook

---

## Troubleshooting

### "Storage engine 'sqlite' not found"
**Cause:** SQLite adapter not registered or import missing.

**Fix:**
```typescript
// Ensure src/infrastructure/storage/server.ts imports sqlite:
import './adapters/sqlite'  // ← Check this is present

// In server actions or migration scripts:
import { createStorageProvider } from '@infra/storage/server'  // ← Use server.ts, not index.ts
```

### "SQLITE_BUSY: database is locked"
**Cause:** Multiple processes or transactions trying to write simultaneously.

**Fix:**
- Single-process deployments: Should not happen; indicates a bug in write-queue serialization
- Multi-process deployments: Expected under load; use PostgreSQL or similar for production
- Temporary: Restart the server to clear locks

### "Row count mismatch during migration"
**Cause:** Data changed during export/import, or corruption.

**Fix:**
1. Stop all write operations
2. Re-run migration
3. If checksum still fails, investigate which collections are missing rows
4. Consider restoring from backup

---

## References

- Storage adapter guide: `docs/storage-adapters.md`
- Launch checklist: `docs/launch-checklist.md`
- Backup & restore: `docs/backup.md`
