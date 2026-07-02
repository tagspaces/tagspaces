/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// In-app purchase service for the Capacitor mobile apps. Wraps
// capacitor-plugin-cdv-purchase (the Capacitor edition of Fovea's
// well-known cordova-plugin-purchase) which talks to StoreKit 2 on iOS
// and Google Play Billing v8.3+ on Android. No third-party data
// processor — receipts only go to Apple/Google.
//
// The entitlement is resolved from the store and exposed synchronously so
// consumers can read it at module-load time without awaiting a Promise.
// After a verified purchase or restore it is refreshed and a soft reload
// re-evaluates the Pro gate with the new value.
//
// The CdvPurchase store is event-driven: register product → set up
// listeners → initialize. Finishing every approved transaction is
// mandatory on StoreKit 2 / Play Billing v8 — otherwise the platforms keep
// retrying and payment is never captured. With no receipt validator wired
// up (receipts stay on-device), we finish() directly on `approved`;
// verify() would wait on a validation service that isn't there, stranding
// the purchase unfinished. No-op on desktop and web.

import AppConfig from '-/AppConfig';
import { openURLExternally } from '-/services/utils-io';
import Links from 'assets/links';

const PRO_PRODUCT_ID = 'org.tagspaces.mobileapp.pro';
const TS_IAP_PRO_KEY = 'tsIapProEntitlement';

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  /** Localized formatted price, e.g. "$29.99". Display this directly. */
  price: string;
  currency?: string;
}

export interface IAPPurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

/**
 * Synchronous Pro entitlement check for the Capacitor mobile platforms.
 * Reflects the entitlement resolved by initializeIap() and refreshed by
 * the post-purchase listeners. Returns false on non-Capacitor builds.
 *
 * Safe to call from a module-load context (no async, no React).
 */
export function isProUnlockedSync(): boolean {
  if (!AppConfig.isCapacitor) return false;
  try {
    return localStorage.getItem(TS_IAP_PRO_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Whether IAP is usable on the current platform. */
export function isIapAvailable(): boolean {
  // The billing-free Lite Android APK strips capacitor-plugin-cdv-purchase and
  // sets TS_DISABLE_IAP=true at build time (see ../builder/buildts.sh). With the
  // native module gone there is no store to talk to, so report IAP unavailable
  // and let the upgrade UI fall back to the "Pro on Google Play" message.
  if (process.env.TS_DISABLE_IAP === 'true') return false;
  return Boolean(AppConfig.isCapacitor);
}

function setEntitlementCache(unlocked: boolean): void {
  try {
    localStorage.setItem(TS_IAP_PRO_KEY, unlocked ? 'true' : 'false');
  } catch {
    /* localStorage unavailable — entitlement won't persist across reloads */
  }
}

function reloadAfterEntitlementChange(): void {
  // The Pro gate is evaluated once at bundle load. After a successful
  // purchase or restore we reload so it re-evaluates. Brief flash; simplest
  // model that doesn't require migrating every `if (Pro)` call site.
  setTimeout(() => {
    try {
      window.location.reload();
    } catch {
      /* ignore */
    }
  }, 250);
}

/**
 * Mark Pro unlocked and, on a LITE→Pro transition, reload so the module-load
 * Pro gate (src/renderer/pro/index.ts) re-evaluates. Centralizing "set cache +
 * reload" here means whichever event wins the race — the `.finished` listener,
 * the owned()/receipt sync, or an explicit restore — triggers exactly one
 * reload; later calls see the cache already true and no-op. Splitting these
 * (one path setting the cache, another owning the reload) previously left the
 * entitlement true but the UI stranded in LITE with no restart — the restore bug.
 */
function grantEntitlement(): void {
  const wasUnlocked = isProUnlockedSync();
  setEntitlementCache(true);
  if (!wasUnlocked) {
    reloadAfterEntitlementChange();
  }
}

// --- CdvPurchase plugin singleton ---

type CdvStore = any;
type CdvPurchaseModule = any;

let cachedModule: CdvPurchaseModule | null = null;
let initializePromise: Promise<void> | null = null;

async function loadPlugin(): Promise<CdvPurchaseModule | null> {
  if (!isIapAvailable()) return null;
  if (cachedModule) return cachedModule;
  try {
    // Dynamic import keeps the dependency out of desktop/web hot paths;
    // webpack still resolves it at build time (it's in node_modules), so
    // run `npm install` after pulling these changes.
    cachedModule = await import('capacitor-plugin-cdv-purchase');
    return cachedModule;
  } catch (e) {
    console.warn(
      '[iap] capacitor-plugin-cdv-purchase not resolvable:',
      (e as Error)?.message,
    );
    return null;
  }
}

/**
 * Initialize the CdvPurchase store once at app boot. Registers our Pro
 * product for the current platform, wires the approved→finish purchase
 * lifecycle, and queries current ownership. If a prior purchase is detected
 * during init (fresh install with the product already owned) grantEntitlement
 * reloads so the Pro module gate at src/renderer/pro/index.ts re-evaluates.
 *
 * Safe to call on any platform — no-ops off-Capacitor. Idempotent: extra
 * calls return the in-flight or completed promise.
 */
export async function initializeIap(): Promise<void> {
  if (!isIapAvailable()) return;
  if (initializePromise) return initializePromise;
  initializePromise = (async () => {
    const mod = await loadPlugin();
    if (!mod) return;
    const { store, ProductType, Platform } = mod;
    if (!store) return;

    // Only ever touch the current device's store. Registering / initializing a
    // foreign platform (e.g. Apple on Android) makes cdv-purchase wait on a
    // native adapter that never reports ready, which hangs initialize()
    // indefinitely — and with it every awaiter (getProProduct/purchasePro/dump).
    const platform = AppConfig.isCapacitoriOS
      ? Platform.APPLE_APPSTORE
      : Platform.GOOGLE_PLAY;

    // Register the non-consumable Pro product for the current store.
    try {
      store.register([
        {
          id: PRO_PRODUCT_ID,
          type: ProductType.NON_CONSUMABLE,
          platform,
        },
      ]);
    } catch (e) {
      console.warn('[iap] store.register failed:', e);
      initializePromise = null; // allow a later retry
      return;
    }

    // Purchase lifecycle without a receipt validator: approved → finish →
    // grant. StoreKit 2 / Play Billing only surface OS-verified transactions,
    // so finishing directly is safe. transaction.verify() is intentionally NOT
    // used — it dispatches to a validation service we don't run, so `.verified`
    // (and therefore finish()) would never fire, leaving the purchase stranded.
    try {
      store
        .when()
        .approved((transaction: any) => {
          try {
            return transaction.finish();
          } catch (e) {
            console.warn('[iap] transaction.finish failed:', e);
            return undefined;
          }
        })
        .finished((transaction: any) => {
          // We register exactly one product (PRO_PRODUCT_ID), so any finished
          // transaction is the Pro unlock. Grant from the transaction rather
          // than store.owned(), which can report false for a genuinely owned
          // product when no validator is configured. grantEntitlement() handles
          // the false→true reload (and is a no-op once already unlocked, so the
          // OS re-emitting the entitlement on later launches can't loop).
          const coversPro =
            !transaction?.products ||
            transaction.products.some?.((p: any) => p?.id === PRO_PRODUCT_ID);
          if (coversPro) {
            grantEntitlement();
          }
        })
        .productUpdated(() => {
          syncOwnedToCache(store);
        })
        .receiptUpdated(() => {
          syncOwnedToCache(store);
        });
    } catch (e) {
      console.warn('[iap] failed to register lifecycle listeners:', e);
    }

    try {
      // Initialize ONLY the current platform (see note above). The timeout is a
      // safety net so a stalled native bridge surfaces as an error instead of
      // hanging callers forever.
      await Promise.race([
        store.initialize([platform]),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('store.initialize timed out after 15s')),
            15000,
          ),
        ),
      ]);
    } catch (e) {
      console.warn('[iap] store.initialize failed:', e);
      initializePromise = null; // allow a later retry
      return;
    }

    // After initialize the store has refreshed receipts and products.
    // syncOwnedToCache → grantEntitlement reloads if this transitioned us from
    // LITE to Pro (fresh install with a prior purchase, or restore on launch).
    syncOwnedToCache(store);
  })();
  return initializePromise;
}

function syncOwnedToCache(store: CdvStore): void {
  try {
    // Upgrade-only. store.owned() is trustworthy when it returns true, but on
    // StoreKit 2 without a validator it can return false for a genuinely owned
    // product — and clearing the cache on that false reading would revoke Pro
    // immediately after a purchase/restore. So only ever grant here (never
    // clear). grantEntitlement() also drives the reload when this owned() read
    // is what flips LITE→Pro (e.g. restore, where `.finished` won't re-fire for
    // an already-finished transaction).
    if (store.owned?.(PRO_PRODUCT_ID)) {
      grantEntitlement();
    }
  } catch (e) {
    console.warn('[iap] owned() lookup failed:', e);
  }
}

/**
 * Fetch the Pro product details (localized price, title) for display
 * inside the Buy Pro sheet. Returns null on non-Capacitor or if the
 * store hasn't loaded the product yet.
 */
export async function getProProduct(): Promise<IAPProduct | null> {
  if (!isIapAvailable()) return null;
  try {
    await initializeIap();
    const mod = await loadPlugin();
    if (!mod) return null;
    const { store } = mod;
    const product = store?.get?.(PRO_PRODUCT_ID);
    if (!product) return null;
    const offer = product.offers?.[0];
    const pricingPhase = offer?.pricingPhases?.[0];
    return {
      id: PRO_PRODUCT_ID,
      title: product.title ?? 'TagSpaces Pro',
      description: product.description ?? '',
      price: pricingPhase?.price ?? '',
      currency: pricingPhase?.currency,
    };
  } catch (e) {
    console.warn('[iap] getProProduct failed:', e);
    return null;
  }
}

/**
 * Initiate the Pro purchase flow. Shows the native StoreKit / Play
 * Billing sheet. Returns immediately after the user closes the sheet;
 * the entitlement is set by the verify→finish listener wired up in
 * initializeIap(), which then triggers a reload. Callers can check
 * isProUnlockedSync() after the reload.
 */
export async function purchasePro(): Promise<IAPPurchaseResult> {
  if (!isIapAvailable()) {
    return { success: false, error: 'IAP not available on this platform' };
  }
  try {
    await initializeIap();
    const mod = await loadPlugin();
    if (!mod) return { success: false, error: 'IAP plugin unavailable' };
    const { store } = mod;
    const product = store?.get?.(PRO_PRODUCT_ID);
    const offer = product?.offers?.[0];
    if (!offer) {
      return { success: false, error: 'Pro product not loaded from store' };
    }
    const result = await store.order(offer);
    // result is undefined on success; or an error object with .isError.
    if (result && (result as any).isError) {
      const err = result as any;
      const code = err.code ?? err.errorCode;
      if (code === 6500 || /cancel/i.test(err.message ?? '')) {
        return { success: false, cancelled: true };
      }
      return { success: false, error: err.message ?? 'Purchase failed' };
    }
    // No error returned — purchase succeeded or is pending. Entitlement cache +
    // reload is handled by the approved→finish→grantEntitlement listener.
    return { success: true };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    if (e?.code === 6500 || /cancel/i.test(msg)) {
      return { success: false, cancelled: true };
    }
    return { success: false, error: msg };
  }
}

/**
 * User-triggered restore. Asks the store to refresh and re-emit any receipts;
 * if the user owns Pro, syncOwnedToCache → grantEntitlement updates the cache
 * and reloads (the `.finished` listener also grants when restore re-emits an
 * unfinished transaction). Returns the resulting entitlement state.
 */
export async function restoreProPurchase(): Promise<{ restored: boolean }> {
  if (!isIapAvailable()) return { restored: false };
  try {
    await initializeIap();
    const mod = await loadPlugin();
    if (!mod) return { restored: false };
    const { store } = mod;
    await store.restorePurchases();
    syncOwnedToCache(store);
    return { restored: isProUnlockedSync() };
  } catch (e) {
    console.warn('[iap] restore failed:', e);
    return { restored: false };
  }
}

/**
 * Open the platform's code redemption UI. iOS presents StoreKit's native
 * redemption sheet via the Capacitor plugin's presentCodeRedemptionSheet()
 * (which calls AppStore.presentOfferCodeRedeemSheet under the hood). After a
 * successful redemption the transaction flows through the normal
 * approved→finish→grantEntitlement listener, so Pro unlocks automatically.
 * Android has no in-app API, so we deep-link to the Play Store's promo page.
 */
export async function presentCodeRedemption(): Promise<void> {
  if (!isIapAvailable()) return;
  try {
    if (AppConfig.isCapacitoriOS) {
      await initializeIap();
      const mod = await loadPlugin();
      if (!mod) return;
      // The redemption sheet lives on the raw Capacitor plugin export
      // (registerPlugin('PurchasePlugin')), NOT on the CdvPurchase `store`
      // object — store.redeemCode / store.iosAdapter don't exist, which is why
      // the button previously no-oped silently.
      const { PurchasePlugin } = mod;
      if (typeof PurchasePlugin?.presentCodeRedemptionSheet === 'function') {
        await PurchasePlugin.presentCodeRedemptionSheet();
      } else {
        console.warn(
          '[iap] presentCodeRedemptionSheet not exposed by plugin build',
        );
      }
      return;
    }
    if (AppConfig.isCapacitorAndroid) {
      // Play has no in-app API for promo code redemption. Open the Play
      // Store redemption page in the system browser (Custom Tab) so the
      // user can paste the code; raw window.open is unreliable in the
      // Capacitor WebView.
      openURLExternally(Links.links.playStoreRedeem, true);
    }
  } catch (e) {
    console.warn('[iap] redeem code failed:', e);
  }
}

export const ProProductId = PRO_PRODUCT_ID;

// Debug helper for verifying the IAP wiring on-device without going through
// the Buy Pro dialog. Exposed on window so it's reachable from the Safari /
// Chrome WebView inspector console:
//
//   await window.__tsIap.dump()
//   → { available, isUnlocked, product, ownedRaw }
// Exposed on all Capacitor builds (not just dev) because Play Billing / StoreKit
// only return products on a store-recognized build (signed, installed from a
// testing track) — which is a production webpack build — so a dev-only gate hid
// this helper from exactly the builds where IAP can be debugged. Read-only
// diagnostics: reports entitlement/product state and can re-run init/restore,
// but cannot grant the entitlement.
if (
  typeof window !== 'undefined' &&
  (AppConfig.isCapacitor || process.env.NODE_ENV === 'development')
) {
  (window as any).__tsIap = {
    isAvailable: isIapAvailable,
    isUnlocked: isProUnlockedSync,
    product: getProProduct,
    init: initializeIap,
    restore: restoreProPurchase,
    productId: PRO_PRODUCT_ID,
    async dump() {
      await initializeIap().catch(() => {});
      const mod = await loadPlugin();
      const store = mod?.store;
      const product = await getProProduct().catch((e) => ({
        error: String(e),
      }));
      let ownedRaw: any = undefined;
      try {
        ownedRaw = store?.owned?.(PRO_PRODUCT_ID);
      } catch (e) {
        ownedRaw = { error: String(e) };
      }
      // The CdvPurchase store may finish initialize() before all products
      // have been fetched from the platform. Expose the live state so we
      // can tell "products didn't load" from "wrong product id" from
      // "SKU status not Ready to Submit".
      const products =
        store?.products?.map?.((p: any) => ({
          id: p.id,
          platform: p.platform,
          type: p.type,
          title: p.title,
          description: p.description,
          canPurchase: p.canPurchase,
          owned: p.owned,
          offerCount: p.offers?.length ?? 0,
          firstPrice: p.offers?.[0]?.pricingPhases?.[0]?.price ?? null,
        })) ?? null;
      const summary = {
        available: isIapAvailable(),
        isUnlocked: isProUnlockedSync(),
        product,
        ownedRaw,
        productId: PRO_PRODUCT_ID,
        storeReady: store?.ready,
        storeProductsCount: store?.products?.length ?? 0,
        storeProducts: products,
        storeErrors: store?.errors ?? null,
        platform: (window as any).Capacitor?.getPlatform?.(),
      };
      console.log('[iap] dump:', summary);
      return summary;
    },
  };
}
