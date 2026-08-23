"use client";

/**
 * Direction-aware route transitions for the mobile tab bar, built on the
 * same-document View Transitions API (Chrome 108+, Safari 18+). React 19.2
 * stable doesn't ship <ViewTransition>, so the bottom nav intercepts its
 * own taps and wraps router.push() itself. Browsers without support (and
 * reduced-motion users) fall back to a plain navigation.
 *
 * The header and tab bar carry their own view-transition-names (see the
 * fm-chrome block in globals.css), so page content slides underneath them
 * like a native app shell.
 */

// Bottom-tab order; lateral slides follow it.
const TAB_ORDER = ["/", "/category", "/fits", "/cart"];
const CART_INDEX = TAB_ORDER.indexOf("/cart");

export type VtDirection = "up" | "down" | "left" | "right" | "fade";

type PushRouter = { push: (href: string) => void };

function tabIndexOf(pathname: string) {
  return TAB_ORDER.indexOf(pathname.split("?")[0].replace(/\/+$/, "") || "/");
}

/**
 * Travel direction of the incoming view. Cart presents like a bottom
 * sheet (up) and dismisses down; tab neighbors slide laterally; anything
 * deeper cross-fades.
 */
export function tabDirection(from: string, to: string): VtDirection {
  const a = tabIndexOf(from);
  const b = tabIndexOf(to);
  if (b === CART_INDEX) return "up";
  if (a === CART_INDEX) return "down";
  if (a !== -1 && b !== -1) return b > a ? "left" : "right";
  return "fade";
}

function canUseViewTransitions() {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Resolve when the App Router has committed `href` (pathname catches up
 * after the RSC payload lands — prefetched tab destinations are near-
 * instant). The 700ms ceiling keeps the frozen old snapshot from ever
 * outliving a slow network navigation; beyond it the transition simply
 * plays over whatever is on screen.
 */
function whenSettled(href: string) {
  const target = new URL(href, window.location.href).pathname;
  const deadline = performance.now() + 700;
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (window.location.pathname === target || performance.now() > deadline) {
        requestAnimationFrame(() => resolve());
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function navigateWithViewTransition(
  router: PushRouter,
  href: string,
  direction: VtDirection,
) {
  if (!canUseViewTransitions()) {
    router.push(href);
    return;
  }

  const root = document.documentElement;
  root.dataset.vt = direction;
  try {
    const transition = document.startViewTransition(async () => {
      router.push(href);
      await whenSettled(href);
    });
    transition.finished
      .catch(() => {})
      .finally(() => {
        delete root.dataset.vt;
      });
  } catch {
    delete root.dataset.vt;
    router.push(href);
  }
}
