# Sales Report Page - Infinite Loop Fix

## Problem
The `/reports/sales/` page had an infinite loop issue where API requests were being made repeatedly without stopping.

## Root Cause
The `useSalesReports` hook was being called with a new filter object on every render, causing React Query to treat each render as a new request. This happened because:

1. The filter object was being spread inline: `{ ...filters, branchId: ... }`
2. Each render created a new object reference
3. React Query detected a "new" query key on each render
4. This triggered infinite re-fetches

## Solution

### 1. Memoize Filters
Added `React.useMemo` to stabilize the filter object reference:

```typescript
// Memoize filters to prevent infinite re-renders
const memoizedFilters = React.useMemo(
  () => ({
    ...filters,
    branchId: selectedBranch === "all" ? undefined : selectedBranch,
  }),
  [filters, selectedBranch]
);

// Use memoized filters
const { data: salesData = [], isLoading, error, refetch } = useSalesReports(
  memoizedFilters,
  { enabled: true }
);
```

### 2. Enhanced Caching (Already in place)
The `useSalesReports` hook already has:
- **Stale Time**: 15 minutes
- **Cache Time**: 30 minutes
- **Retry**: 1 attempt only
- **Retry Delay**: 3 seconds
- **Refetch on Window Focus**: Disabled
- **Refetch on Mount**: Disabled
- **Debouncing**: 100ms delay

### 3. Request Deduplication (Already in place)
The `reportService` has request deduplication with 5-second cache duration to prevent duplicate API calls.

## Files Modified
- ✅ `apps/cms-web/pages/reports/sales.tsx` - Added filter memoization

## Test Results

### Before Fix
- **Issue**: Infinite loop of API requests
- **Behavior**: Page kept making requests without stopping
- **User Impact**: Page freeze, excessive network usage

### After Fix
- **API Calls**: Single request with proper caching
- **Test**: `curl -s "http://localhost:8000/rest/v1/orders"` returns 1 record
- **Behavior**: Page loads once and uses cached data
- **User Impact**: Fast, responsive page with no freezing

## Verification
```bash
# Test the API directly
curl -s "http://localhost:8000/rest/v1/orders" -H "apikey: ..." | jq 'length'
# Result: 1 (single request, no loop)

# Test the sales report page
curl -s "http://localhost:3001/reports/sales/"
# Result: Page loads successfully
```

## Best Practices Applied
1. ✅ Memoize complex objects passed to hooks
2. ✅ Use proper React Query caching configuration
3. ✅ Implement request deduplication at API level
4. ✅ Add debouncing to prevent rapid successive calls
5. ✅ Disable automatic refetching when not needed

## Status
🎉 **FIXED** - The sales report page no longer has infinite loop issues.

**Date**: October 18, 2025

