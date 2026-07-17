# POS Storage Backup & Restore

This document describes how to manually export and import backups of your POS database.

## Prerequisites

- **Chromium/Edge (recommended):** Full support for File System Access API for direct file saving
- **Firefox/Safari:** Full support with fallback to `<a download>` / `<input type=file>`
- **Private/Incognito mode:** May have limited IndexedDB storage

## Export (Backup)

To create a backup of your current POS data:

1. Open the POS application in your browser
2. Navigate to **Settings** → **Backup** (or the designated backup UI)
3. Click **Export Backup**
4. Choose a location and filename (default: `pos-backup-YYYY-MM-DD.json`)
5. Click **Save**

**Result:** A JSON file is saved to your computer containing all POS data in the canonical export format.

### File Format

The exported JSON follows this structure:

```json
{
  "format": "pos.storage.export",
  "formatVersion": 1,
  "engine": "indexeddb",
  "schemaVersion": 1,
  "exportedAt": "2024-01-15T10:30:45.123Z",
  "entities": [
    {
      "entity": "products",
      "version": 1,
      "records": [
        {
          "id": "prod-001",
          "name": "Widget A",
          "sku": "SKU-001",
          "price": { "amount": 100, "currency": "USD" },
          "stock": { "quantity": 50, "unit": "pcs" },
          "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
          "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
        }
      ]
    }
    // ... more entity types
  ]
}
```

**Key points:**
- `format` must be `pos.storage.export` (used for validation)
- `formatVersion` must be `1`
- `schemaVersion` records the database schema version at export time
- `Date` objects are serialized as `{ "$date": "ISO8601" }` and are automatically restored on import

## Import (Restore)

To restore from a backup:

1. Open the POS application in your browser (or a fresh profile for testing)
2. Navigate to **Settings** → **Backup**
3. Click **Import Backup**
4. Select a previously exported JSON file
5. Choose **Replace** (clear existing data) or **Merge** (add to existing data)
6. Click **Import**

**Result:** Data is restored to your POS database.

### Import Modes

- **Replace:** Clears all existing collections and imports only the backup data. Use this to restore to a specific point in time.
- **Merge:** Appends records from the backup. If a record with the same ID exists, it is overwritten by the backup version.

## Verification

After a backup/restore round-trip, verify the import succeeded:

1. Check **Products** → confirm a known product (e.g., `product-001`) is present
2. Verify **Date fields** are correct (e.g., `createdAt` shows the original date, not today)
3. Check **Inventory levels** to ensure stock quantities are preserved

Example verification:
- Export from Tab A → `pos-backup-2024-01-15.json`
- Clear IndexedDB in Tab B (private profile) or open fresh profile
- Import the file into Tab B
- Look up product ID `prod-001` → should match the original name and dates

## Common Issues

### "Storage quota exceeded"
- Your browser's IndexedDB has reached its storage limit
- Free up space by clearing caches or removing old data
- On some browsers, you may need to increase the quota for the origin

### "File not recognized"
- The file must be a JSON export from POS Storage (check the `format` field)
- Ensure the file was not edited or corrupted
- Try exporting again from a working instance

### "Upgrade blocked by another tab"
- Another browser tab has an older version of the app open
- Close all other tabs/windows running POS and try again
- The adapter will automatically retry when the conflict clears

### "IndexedDB is not available"
- You are in a private/incognito window with IndexedDB disabled
- Switch to a regular browser window
- Some browsers (Safari on older iOS) may disable IndexedDB in certain contexts

## Round-Trip Example

This example demonstrates a complete backup/restore cycle:

### Step 1: Initial State (Tab A)
```
Create a product:
  ID: prod-test-001
  Name: "Test Widget"
  SKU: "TEST-001"
  Price: 99.99 USD
  Stock: 42 pcs
  Created: 2024-01-15T10:00:00Z
```

### Step 2: Export Backup (Tab A)
- Click **Export Backup** → Save as `backup-2024-01-15.json`
- File now contains the product in canonical JSON format

### Step 3: Fresh Profile (Tab B)
- Open a fresh/private profile with empty IndexedDB
- Navigate to POS app

### Step 4: Import Backup (Tab B)
- Click **Import Backup** → Select `backup-2024-01-15.json`
- Choose **Replace** → Click **Import**

### Step 5: Verification (Tab B)
- Search for product `prod-test-001`
- Verify name is "Test Widget" (not changed)
- Verify created date is 2024-01-15T10:00:00Z (not today)
- Verify stock is 42 pcs (correct)

✅ **Round-trip successful:** data survives export→import with full fidelity

## Technical Details

### Streaming Export
For large datasets (thousands of records), the export is streamed in ~1 MB chunks to avoid memory spikes. This is transparent to the user but ensures backups remain fast even with large data sets.

### Date Serialization
POS uses the `SerializationCodec` to preserve `Date` objects:
- On export: `Date` → `{ "$date": "2024-01-15T10:00:00.000Z" }`
- On import: `{ "$date": "..." }` → `Date` instance

This ensures dates are not lost or converted to strings during backup.

### Atomicity
Imports are atomic — the entire import succeeds or fails as one unit. If an error occurs mid-import, the database state is rolled back to its pre-import condition (assuming replace mode; merge mode is less strict).

## Disaster Recovery

If you need to recover from a catastrophic loss:

1. Export a known-good backup from an archive or cloud storage
2. Open a fresh browser profile to guarantee a clean slate
3. Import the backup with **Replace** mode
4. Verify data integrity
5. Resume operations

For critical backups, consider:
- Storing multiple versions (daily/weekly snapshots)
- Uploading backups to cloud storage (outside the browser)
- Testing recovery procedures regularly

## Limitations

- **IndexedDB size limits:** Browsers typically allow 10–50 MB per origin; large POS instances may approach these limits
- **Cross-browser export:** A backup exported from Chrome will work in Firefox, but the file is independent of the app engine
- **No delta backups:** Each export is a full snapshot; incremental backups are not supported (consider your own archival strategy)
- **Encryption:** Backups are stored as plain JSON on your disk; consider encrypting files at rest if sensitive

## Support

For issues with backups, check:
1. Browser console for error messages (`F12` → **Console**)
2. This document for known issues
3. Ensure your browser and app are up to date
