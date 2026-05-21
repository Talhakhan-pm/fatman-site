import type { useCatalogEditor } from "./use-catalog-editor";
import { buttonClass, inputClass, labelClass } from "./ui";

export function AdminAuth({ editor }: { editor: ReturnType<typeof useCatalogEditor> }) {
  const {
    adminSessionRequired,
    sessionState,
    sessionPassword,
    setSessionPassword,
    sessionError,
    sessionBusy,
    handleUnlockAdmin,
  } = editor;

  if (!adminSessionRequired || sessionState === "unlocked") {
    return null;
  }

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10">
        <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl shadow-black/20">
          <div>
            <h1 className="text-3xl font-black">Catalog Admin</h1>
            <p className="mt-2 text-sm text-white/70">
              Unlock the admin area with your catalog password. This creates a secure server-side
              session cookie so you do not have to keep pasting the write key into developer tools.
            </p>
          </div>

          {sessionState === "checking" ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/75">
              Checking admin session…
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label className={labelClass}>Admin password</label>
                <input
                  type="password"
                  className={`${inputClass} mt-1`}
                  value={sessionPassword}
                  onChange={(event) => setSessionPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleUnlockAdmin();
                    }
                  }}
                  placeholder="Enter FATMAN_ADMIN_WRITE_KEY"
                  autoComplete="current-password"
                />
              </div>

              {sessionError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {sessionError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => void handleUnlockAdmin()}
                  disabled={sessionBusy || !sessionPassword.trim()}
                >
                  {sessionBusy ? "Unlocking…" : "Unlock admin"}
                </button>
                <p className="text-xs text-white/55">
                  Write key unlocks normal catalog tools. Seed key also works if you need setup
                  actions later.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
