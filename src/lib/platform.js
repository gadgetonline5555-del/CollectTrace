// Heuristic detection of the Base44 native app webview (iOS WKWebView / Android WebView).
// Base44's native mobile build does not yet support StoreKit / Google Play Billing,
// so digital purchases must happen on the web — the native app only checks payment
// status to unlock content (App Store 3.1.1 / Google Play Billing policy).
export function isNativeMobileApp() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (!/iphone|ipad|ipod|android/i.test(ua)) return false;
  // iOS WKWebView omits the "Safari/<ver>" token that Mobile Safari includes.
  const iosWebview = /iphone|ipad|ipod/i.test(ua) && !/safari\/\d/i.test(ua);
  // Android WebView UA carries "; wv)".
  const androidWebview = /android/i.test(ua) && /wv\)/i.test(ua);
  return iosWebview || androidWebview;
}

export function openExternal(url) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}