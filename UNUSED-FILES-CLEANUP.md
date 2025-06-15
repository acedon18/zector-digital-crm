# Unused Files Cleanup Plan

The project currently contains several backup or unused files that should be consolidated or removed to improve code clarity and maintainability.

## Files to Review

| File | Status | Recommendation |
|------|--------|---------------|
| `src/components/dashboard/LiveVisitors.bak.tsx` | Backup file | Archive or remove |
| `src/components/dashboard/LiveVisitorsFixed.tsx` | Alternative implementation | Compare with current, migrate useful code, then remove |
| `server.js` | Duplicate backend file | Compare with `server.cjs`, then remove if redundant |
| `src/backend/trackingServer.original.ts` | Backup of original TS file | Remove after verifying `trackingServer.ts` is working |

## Cleanup Procedure

1. **Before removing any files**:
   - Create a backup branch: `git checkout -b backup-files-archive`
   - Commit all these files to this branch: `git add . && git commit -m "Archive backup files before cleanup"`

2. **For each file**:
   - Compare with its current version using a diff tool
   - Extract any valuable patterns or code that might be useful
   - Document the differences if significant

3. **After cleanup**:
   - Remove the files from the main branch
   - Update documentation to reflect changes
   - Ensure all tests still pass

## Recommended Commands

```powershell
# Create backup branch
git checkout -b backup-files-archive

# Commit current state
git add .
git commit -m "Archive backup files before cleanup"

# Return to main branch
git checkout main

# Remove backup files
Remove-Item src/components/dashboard/LiveVisitors.bak.tsx
Remove-Item src/components/dashboard/LiveVisitorsFixed.tsx
Remove-Item server.js
Remove-Item src/backend/trackingServer.original.ts

# Commit cleanup
git add .
git commit -m "Remove unused backup files"
```

## Documentation Update

After cleanup, update the project README or documentation to:
1. Note that backup files have been removed
2. Explain that a backup branch exists if historical versions are needed
3. Ensure all developer onboarding information is up to date
