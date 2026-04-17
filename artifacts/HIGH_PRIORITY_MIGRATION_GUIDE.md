/**
 * HIGH PRIORITY FIXES - QUICK MIGRATION GUIDE
 * Apply these patterns to each affected file
 */

// ============ FILE-BY-FILE FIX INSTRUCTIONS ============

/**
 * pages/promo-codes.tsx
 * =====================================
 * Issues: 5x `any` types, inconsistent naming
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { PromoCode } from "@/types";
 *    import { safeObject } from "@/types/safe-data";
 * 
 * 2. Replace: promo: any
 *    With: promo?: PromoCode
 * 
 * 3. Replace: const set = (k: string, v: any) => setForm(f => ...)
 *    With: const set = (k: keyof typeof form, v: any) => setForm(f => ...)
 * 
 * 4. Replace: const payload: any = { ... }
 *    With: const payload: Omit<PromoCode, 'id'> = { ... }
 * 
 * 5. Handle mutation errors properly:
 *    onError: (e: any) => toast(...)
 *    Replace with:
 *    onError: (e: Error) => toast({ title: "Failed", description: e.message })
 */

/**
 * pages/gps-alerts.tsx
 * =====================================
 * Issues: 4x `any` types, missing error handling
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { GPSAlert } from "@/types";
 *    import { safeArray } from "@/types/safe-data";
 * 
 * 2. Replace: const alerts: any[] = data?.alerts ?? [];
 *    With: const alerts = safeArray<GPSAlert>(data?.alerts);
 * 
 * 3. Replace: {alerts.map((alert: any) => (...))}
 *    With: {alerts.map((alert) => (...))}  // TypeScript knows type now
 * 
 * 4. Replace error handlers:
 *    onError: (e: any) => toast(...)
 *    With:
 *    onError: (e: Error) => {
 *      console.error("[GPSAlerts] Error:", e);
 *      toast({ title: "Failed", description: e.message });
 *    }
 */

/**
 * pages/rides.tsx
 * =====================================
 * Issues: 5x `any` types, missing null checks, error catch block
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { Ride, RideAuditTrail } from "@/types";
 *    import { safeArray, safeGet } from "@/types/safe-data";
 * 
 * 2. Replace: const trail: any[] = auditData?.trail ?? [];
 *    With: const trail = safeArray<RideAuditTrail>(auditData?.trail);
 * 
 * 3. Replace: const riders: any[] = ...
 *    With: const riders = safeArray<Rider>(riderData);
 * 
 * 4. Fix line 592 error handling:
 *    BEFORE: .catch(() => {});
 *    AFTER: .catch((error) => {
 *      console.error("[Rides] Failed to fetch details:", error);
 *    });
 * 
 * 5. Replace any ride access with safe checks:
 *    const rideStatus = safeGet<string>(ride, "status", "unknown");
 */

/**
 * pages/riders.tsx
 * =====================================
 * Issues: 3x `any` types, undefined checks needed
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { RiderPenalty } from "@/types";
 *    import { safeArray, safeNumber } from "@/types/safe-data";
 * 
 * 2. Replace: const penalties: any[]
 *    With: const penalties = safeArray<RiderPenalty>(data?.penalties);
 * 
 * 3. Replace amount calculations:
 *    BEFORE: const totalWallet = riders.reduce((s, r: any) => s + r.walletBalance, 0);
 *    AFTER:  const totalWallet = riders.reduce((s, r: Rider) => {
 *              return s + (safeNumber(r.walletBalance) ?? 0);
 *            }, 0);
 * 
 * 4. Validate amounts before using:
 *    import { validateAmount } from "@/lib/validation";
 *    const amount = validateAmount(userInput, { min: 0, max: 100000 });
 *    if (amount === null) {
 *      toast({ title: "Invalid amount" });
 *      return;
 *    }
 */

/**
 * pages/users.tsx
 * =====================================
 * Issues: 2x `any` types, document parsing error, missing null checks
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { User } from "@/types";
 *    import { safeObject, extractDocuments } from "@/types/safe-data";
 * 
 * 2. Fix line 854 error handling:
 *    BEFORE: } catch {}
 *    AFTER:  } catch (error) {
 *              console.error("[Users] Failed to parse documents:", error);
 *            }
 * 
 * 3. Replace document extraction:
 *    BEFORE: const parsed = JSON.parse(...);
 *            for (const f of parsed) { ... }
 *    AFTER:  const { files, error } = extractDocuments(user.kyc);
 *            if (error) console.error(error);
 *            for (const f of files) { ... }
 * 
 * 4. Safe data access:
 *    BEFORE: <p>{userData?.name || "Unknown"}</p>
 *    AFTER:  <p>{safeString(userData?.name) || "Unknown"}</p>
 */

/**
 * pages/orders/GpsMiniMap.tsx
 * =====================================
 * Issues: Silent catch block, missing error logging
 * 
 * CHANGES:
 * 1. Line 26 error handling:
 *    BEFORE: }).catch(() => {});
 *    AFTER: }).catch((error) => {
 *             console.error("[GpsMiniMap] Failed to load map:", error);
 *             // Map will render empty but won't crash
 *           });
 */

/**
 * pages/orders/GpsStampCard.tsx
 * =====================================
 * Issues: Silent catch block, missing error logging
 * 
 * CHANGES:
 * 1. Line 26 error handling:
 *    BEFORE: .catch(() => {});
 *    AFTER: .catch((error) => {
 *             console.error("[GpsStampCard] Failed to load library:", error);
 *           });
 */

/**
 * pages/sos-alerts.tsx
 * =====================================
 * Issues: 1x silent catch, missing error feedback
 * 
 * CHANGES:
 * 1. Line 311 error handling:
 *    BEFORE: } catch {}
 *    AFTER: } catch (error) {
 *             console.error("[SOS] Failed to load alerts:", error);
 *             toast({ title: "Error", description: "Failed to load SOS alerts" });
 *           }
 * 
 * 2. Line 405 socket error handling:
 *    BEFORE: } catch { /* socket will update UI anyway */ }
 *    AFTER: } catch (error) {
 *             console.error("[SOS] Failed to acknowledge:", error);
 *             // Socket will update UI anyway
 *           }
 */

/**
 * pages/dashboard.tsx
 * =====================================
 * Issues: Missing type, null checks needed
 * 
 * CHANGES:
 * 1. At top, add:
 *    import type { DashboardStats } from "@/types";
 *    import { extractStats } from "@/types/safe-data";
 * 
 * 2. Replace stats extraction:
 *    BEFORE: const statsData = data as Record<string, unknown>;
 *            console.log(statsData.totalUsers);  // Could be undefined!
 *    AFTER:  const stats = extractStats(data);
 *            console.log(stats.totalUsers);      // Always a number
 * 
 * 3. Add error boundary:
 *    import { withErrorBoundary } from "@/components/ErrorBoundary";
 *    export default withErrorBoundary(Dashboard);
 */

/**
 * pages/kyc.tsx
 * =====================================
 * Issues: Missing response validation, no error handling
 * 
 * CHANGES:
 * 1. Add validation imports:
 *    import { isApiResponse } from "@/types/safe-data";
 *    import { validateEmail } from "@/lib/validation";
 * 
 * 2. Validate API responses:
 *    BEFORE: const e = await r.json();
 *            throw new Error(e.error ?? "Approval failed");
 *    AFTER:  const response = await r.json();
 *            if (!isApiResponse(response)) {
 *              throw new Error("Invalid response format");
 *            }
 *            throw new Error(response.error ?? "Approval failed");
 * 
 * 3. Update error handling in mutations
 */

/**
 * pages/settings-security.tsx
 * =====================================
 * Issues: 4x missing error handling
 * 
 * CHANGES:
 * 1. Lines 83, 125, 155, 171 - All need proper error logging:
 *    BEFORE: } catch {}
 *    AFTER: } catch (error) {
 *             console.error("[Settings Security] Operation failed:", error);
 *             toast({ title: "Error", description: getErrorMessage(error) });
 *           }
 * 
 * 2. Add import:
 *    import { getErrorMessage } from "@/types/safe-data";
 */

/**
 * pages/settings-system.tsx
 * =====================================
 * Issues: 2x missing error handling
 * 
 * CHANGES:
 * 1. Lines 82 (snapshot loading):
 *    BEFORE: }).catch(() => {});
 *    AFTER: }).catch((error) => {
 *             console.error("[Settings] Failed to load snapshots:", error);
 *           });
 * 
 * 2. Line 139 (snapshot deletion):
 *    BEFORE: } catch {}
 *    AFTER: } catch (error) {
 *             console.error("[Settings] Failed to delete snapshot:", error);
 *           }
 */

/**
 * pages/broadcast.tsx
 * =====================================
 * Issues: Missing input validation
 * 
 * CHANGES:
 * 1. Add import:
 *    import { sanitizeInput, validateAmount } from "@/lib/validation";
 * 
 * 2. Form submission validation:
 *    BEFORE: if (!formData.message) return;
 *    AFTER: const message = sanitizeInput(formData.message);
 *           if (!message) {
 *             toast({ title: "Message required" });
 *             return;
 *           }
 */

/**
 * pages/settings.tsx
 * =====================================
 * Issues: Missing proper option types
 * 
 * CHANGES:
 * 1. Replace: Record<CatKey, { label: string; icon: any; color: string; }>
 *    With: Record<CatKey, { label: string; icon: React.ReactNode; color: string; }>
 */

/**
 * lib/api.ts and lib/api-secure.ts
 * =====================================
 * Already updated! Uses:
 * - authStore for secure token management
 * - csrfManager for CSRF token handling
 * - Proper error normalization with types
 * - No more localStorage risks
 */

/**
 * hooks/use-admin.ts
 * =====================================
 * Issues: Incomplete implementations
 * 
 * CHANGES:
 * 1. Ensure all hook implementations are complete
 * 2. Add proper error types to all mutations:
 *    useCreateProduct: async (data: CreateProductInput) => Promise<Product>
 *    useUpdateProduct: async (data: UpdateProductInput) => Promise<Product>
 *    etc.
 * 
 * 3. Use useSafeMutation wrapper for better error handling:
 *    const { mutate, error } = useSafeMutation({
 *      mutationFn: (data) => api.createProduct(data),
 *      onError: (error) => toast({ title: "Failed to create product" }),
 *    });
 */

/**
 * ALL PAGE COMPONENTS
 * =====================================
 * Apply Error Boundary:
 * 
 * 1. At the BOTTOM of each page component file, add:
 * 
 *    export default withErrorBoundary(PageComponent);
 * 
 *    Instead of:
 * 
 *    export default PageComponent;
 * 
 * This ensures errors are caught and don't crash the entire app.
 */

/**
 * FORM COMPONENTS
 * =====================================
 * Apply Input Validation:
 * 
 * import { sanitizeInput, validateEmail, validateAmount } from "@/lib/validation";
 * 
 * Before sending form data to API:
 * 1. Sanitize string inputs
 * 2. Validate format (email, phone, amount)
 * 3. Check required fields
 * 4. Show specific error messages
 * 
 * Example:
 * const handleSubmit = (formData) => {
 *   const email = validateEmail(formData.email) ? formData.email : null;
 *   const amount = validateAmount(formData.amount, { min: 1, max: 10000 });
 *   
 *   const errors = [];
 *   if (!email) errors.push("Invalid email");
 *   if (amount === null) errors.push("Invalid amount");
 *   
 *   if (errors.length) {
 *     toast({ title: "Validation failed", description: errors.join(", ") });
 *     return;
 *   }
 *   
 *   // Safe to send
 *   api.submit({ ...formData, email, amount });
 * };
 */

export const MigrationGuide = {
  totalFilesNeedingUpdates: 15,
  estimatedTimePerFile: "5-10 minutes",
  totalEstimatedTime: "2-3 hours",
  difficultyLevel: "Easy - copy/paste patterns",
  breakingChanges: 0,
  testingRequired: "Visual QA, no unit tests needed",
};
