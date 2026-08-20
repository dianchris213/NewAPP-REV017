import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useModalA11y } from "@/hooks/use-modal-a11y";
import {
  useApp,
  WALLET_TYPE_LABEL,
  formatIDR,
  type Language,
  type Settings as SettingsState,
  type TxType,
  type WalletType,
} from "@/lib/app-store";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan - Catatan Keuangan Mini App" },
      {
        name: "description",
        content: "Atur bahasa, mata uang, tema, notifikasi, keamanan, dan ekspor data keuangan.",
      },
      { property: "og:title", content: "Pengaturan - Catatan Keuangan Mini App" },
      {
        property: "og:description",
        content: "Preferensi aplikasi, keamanan, dan pengelolaan data.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  trailing: React.ReactNode;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className="flex w-full items-center gap-3 border-b border-outline-variant/20 py-3 text-left last:border-0 focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-primary">
        <Icon name={icon} className="text-[20px]" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-on-surface">{title}</span>
        {subtitle ? <span className="text-xs text-on-surface-variant">{subtitle}</span> : null}
      </span>
      {trailing}
    </Wrapper>
  );
}

function Toggle({ id, label }: { id: keyof SettingsState; label: string }) {
  const { settings, toggleSetting } = useApp();
  const on = settings[id];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => toggleSetting(id)}
      className={`h-6 w-11 rounded-full border p-0.5 transition-colors ${
        on ? "border-primary bg-primary-container/60" : "border-outline-variant/40 bg-surface-variant"
      }`}
    >
      <span
        className={`block h-5 w-5 rounded-full transition-transform ${
          on ? "translate-x-5 bg-primary" : "translate-x-0 bg-outline"
        }`}
      />
    </button>
  );
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

function LanguageToggle() {
  const { language, setLanguage } = useApp();
  return (
    <div
      role="radiogroup"
      aria-label="Bahasa aplikasi"
      data-testid="language-toggle"
      className="flex items-center gap-1 rounded-full bg-surface-container p-1"
    >
      {LANGUAGES.map((l) => {
        const active = language === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={`language-${l.value}`}
            onClick={() => setLanguage(l.value)}
            className={`h-7 min-w-[42px] rounded-full px-3 text-[12px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary/60 ${
              active
                ? "bg-primary-container/40 text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

const Chevron = <Icon name="chevron_right" className="text-[20px] text-on-surface-variant" />;

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-stack-lg">
      <h2 className="mb-2 text-label uppercase text-primary">{label}</h2>
      <div className="glass-card rounded-[16px] px-4">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const { user, logout, settings, language, categories, wallets } = useApp();
  const navigate = useNavigate();
  const copy = t(language);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);

  return (
    <AppShell topBar={<TopBar eyebrow={copy.settingsEyebrow} title={copy.settingsTitle} />}>
      <div className="gradient-hero flex items-center gap-3 rounded-[24px] p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
          <Icon name="person" />
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-base font-semibold text-on-surface">
            {user?.name ?? copy.notSignedIn}
          </span>
          <span className="text-xs text-on-surface-variant">
            {user
              ? `${copy.signedInVia} ${user.provider === "telegram" ? "Telegram" : "Google"}`
              : copy.profileNotLinked}
          </span>
        </div>
        <span className="rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-semibold text-on-surface">
          {user?.handle ?? "-"}
        </span>
      </div>

      <Group label={copy.groupPreferences}>
        <Row
          icon="language"
          title={copy.language}
          subtitle={copy.languageHint}
          trailing={<LanguageToggle />}
        />
        <Row
          icon="dark_mode"
          title={copy.theme}
          subtitle={settings.darkTheme ? copy.themeOn : copy.themeOff}
          trailing={<Toggle id="darkTheme" label={copy.theme} />}
        />
        <Row
          icon="notifications"
          title={copy.notifications}
          subtitle={settings.pushNotifications ? copy.notificationsOn : copy.notificationsOff}
          trailing={<Toggle id="pushNotifications" label={copy.notifications} />}
        />
      </Group>

      <Group label={copy.groupSecurity}>
        <Row
          icon="fingerprint"
          title={copy.appLock}
          subtitle={settings.biometricLock ? copy.appLockOn : copy.appLockOff}
          trailing={<Toggle id="biometricLock" label={copy.appLock} />}
        />
        {settings.biometricLock ? (
          <p className="pb-3 text-[11px] text-on-surface-variant/70">{copy.appLockNote}</p>
        ) : null}
        <Row
          icon="cloud_sync"
          title={copy.cloudSync}
          subtitle={settings.cloudSync ? copy.cloudSyncOn : copy.cloudSyncOff}
          trailing={<Toggle id="cloudSync" label={copy.cloudSync} />}
        />
      </Group>

      <Group label={copy.groupData}>
        <Row
          icon="category"
          title={copy.categories}
          subtitle={
            categories.length ? `${categories.length} · ${copy.manage}` : copy.categoriesEmpty
          }
          trailing={Chevron}
          onClick={() => setCategoryOpen(true)}
        />
        <Row
          icon="account_balance_wallet"
          title={copy.fundSources}
          subtitle={wallets.length ? `${wallets.length} · ${copy.manage}` : copy.fundSourcesEmpty}
          trailing={Chevron}
          onClick={() => setFundOpen(true)}
        />
        <Row
          icon="download"
          title={copy.exportData}
          subtitle={copy.exportHint}
          trailing={Chevron}
        />
      </Group>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-stack-lg flex w-full items-center justify-center gap-2 rounded-[16px] bg-surface-container-high py-4 text-base font-semibold text-on-surface"
      >
        <Icon name="logout" className="text-[20px]" /> {copy.logout}
      </button>
      <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] border border-error/30 py-4 text-base font-semibold text-error">
        <Icon name="delete" className="text-[20px]" /> {copy.deleteAccount}
      </button>

      {categoryOpen ? <CategorySheet onClose={() => setCategoryOpen(false)} /> : null}
      {fundOpen ? <FundSourceSheet onClose={() => setFundOpen(false)} /> : null}
    </AppShell>
  );
}

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet"];

/** Manage user-owned fund sources (Sumber Dana). Empty by default. */
export function FundSourceSheet({ onClose }: { onClose: () => void }) {
  const { language, wallets, addWallet, renameWallet, deleteWallet, walletUsage, walletPending } =
    useApp();
  const copy = t(language);
  const ref = useModalA11y<HTMLDivElement>(true, onClose);
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [status, setStatus] = useState("");

  const list = useMemo(
    () => [...wallets].sort((a, b) => a.name.localeCompare(b.name)),
    [wallets],
  );

  const announce = (message: string, ok: boolean) => {
    setStatus(message);
    if (ok) toast.success(message);
    else toast.error(message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (walletPending.add) return;
    const numeric = Number(balance.replace(/\D/g, "")) || 0;
    const trimmed = name.trim().replace(/\s+/g, " ");
    const duplicate = wallets.some((w) => w.name.toLowerCase() === trimmed.toLowerCase());
    if (trimmed.length < 2 || trimmed.length > 24 || duplicate) {
      setError(copy.invalidFundSource);
      announce(copy.invalidFundSource, false);
      return;
    }
    const ok = await addWallet({ name: trimmed, type, balance: numeric });
    if (!ok) {
      setError(copy.invalidFundSource);
      announce(copy.invalidFundSource, false);
      return;
    }
    setName("");
    setBalance("");
    setError(undefined);
    announce(copy.fundSourceAdded, true);
  };

  const commitRename = async (id: string) => {
    if (walletPending.byId[id]) return;
    if (!(await renameWallet(id, editingName))) {
      setRowError({ id, message: copy.invalidFundSource });
      announce(copy.invalidFundSource, false);
      return;
    }
    setEditingId(null);
    setEditingName("");
    setRowError(null);
    announce(copy.fundSourceRenamed, true);
  };

  const remove = async (id: string) => {
    if (walletPending.byId[id]) return;
    if (walletUsage(id) > 0 || !(await deleteWallet(id))) {
      setRowError({ id, message: copy.fundSourceInUse });
      announce(copy.fundSourceInUse, false);
      return;
    }
    setRowError(null);
    announce(copy.fundSourceDeleted, true);
  };

  return (
    <div
      className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-source-title"
        aria-describedby="fund-source-hint"
        data-testid="fund-source-sheet"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[26px] border-t border-outline-variant/20 bg-surface-container-high p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-2xl"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-3 block h-1 w-10 rounded-full bg-outline-variant/60"
        />
        <div className="flex items-center justify-between">
          <h3 id="fund-source-title" className="m-0 text-title text-on-surface">
            {copy.fundSources}
          </h3>
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={submit} noValidate>
          <label className="flex flex-col gap-1">
            <span className="text-meta text-on-surface-variant/80">{copy.fundSourceName}</span>
            <input
              value={name}
              maxLength={24}
              required
              autoComplete="off"
              data-autofocus
              data-testid="fund-source-name"
              aria-invalid={!!error}
              aria-errormessage={error ? "fund-source-error" : undefined}
              aria-describedby="fund-source-hint"
              disabled={walletPending.add}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(undefined);
              }}
              className="h-12 rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-meta text-on-surface-variant/80">{copy.fundSourceType}</span>
            <select
              value={type}
              data-testid="fund-source-type"
              onChange={(e) => setType(e.target.value as WalletType)}
              className="h-12 rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {WALLET_TYPES.map((wt) => (
                <option key={wt} value={wt}>
                  {WALLET_TYPE_LABEL[wt]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-meta text-on-surface-variant/80">{copy.fundSourceBalance}</span>
            <input
              inputMode="numeric"
              data-testid="fund-source-balance"
              value={(Number(balance.replace(/\D/g, "")) || 0).toLocaleString("id-ID")}
              onChange={(e) => setBalance(e.target.value.replace(/\D/g, "").slice(0, 15))}
              className="h-12 rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </label>
          <p id="fund-source-hint" className="m-0 text-[11px] text-on-surface-variant/70">
            {copy.fundSourceHint}
          </p>
          {error ? (
            <p
              id="fund-source-error"
              role="alert"
              data-testid="fund-source-form-error"
              className="m-0 text-[11px] font-semibold text-error"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            data-testid="fund-source-submit"
            disabled={walletPending.add}
            aria-busy={walletPending.add}
            className="gradient-primary flex h-12 items-center justify-center gap-2 rounded-full text-[13px] font-bold text-on-primary-container transition-transform active:scale-95 disabled:opacity-60"
          >
            {walletPending.add ? (
              <Icon name="progress_activity" className="animate-spin text-[18px]" />
            ) : null}
            {walletPending.add ? copy.saving : copy.addFundSource}
          </button>
        </form>

        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {status}
        </p>

        <ul
          aria-label={copy.fundSources}
          aria-busy={walletPending.add}
          className="mt-4 list-none rounded-2xl bg-surface-container px-4 py-1"
        >
          {list.length ? (
            list.map((w) => {
              const used = walletUsage(w.id);
              const editing = editingId === w.id;
              const message = rowError && rowError.id === w.id ? rowError.message : null;
              return (
                <li
                  key={w.id}
                  data-testid={`fund-source-item-${w.id}`}
                  className="flex flex-col gap-2 border-b border-outline-variant/20 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <input
                        autoFocus
                        value={editingName}
                        maxLength={24}
                        aria-label={`${copy.renameFundSource} ${w.name}`}
                        aria-invalid={!!message}
                        data-testid={`fund-source-rename-input-${w.id}`}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void commitRename(w.id);
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingId(null);
                            setRowError(null);
                          }
                        }}
                        className="h-10 min-w-0 flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-high px-3 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      />
                    ) : (
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-on-surface">
                          {w.name}
                        </span>
                        <span className="truncate text-[11px] text-on-surface-variant/80">
                          {`${WALLET_TYPE_LABEL[w.type]} · ${formatIDR(w.balance)} · ${used}`}
                        </span>
                      </span>
                    )}

                    {editing ? (
                      <>
                        <button
                          type="button"
                          aria-label={copy.save}
                          data-testid={`fund-source-rename-save-${w.id}`}
                          disabled={!!walletPending.byId[w.id]}
                          aria-busy={!!walletPending.byId[w.id]}
                          onClick={() => void commitRename(w.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container/40 text-primary focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="check" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          aria-label={copy.cancel}
                          onClick={() => {
                            setEditingId(null);
                            setRowError(null);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="close" className="text-[18px]" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`${copy.rename} ${w.name}`}
                          data-testid={`fund-source-rename-${w.id}`}
                          onClick={() => {
                            setEditingId(w.id);
                            setEditingName(w.name);
                            setRowError(null);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${copy.delete} ${w.name}`}
                          data-testid={`fund-source-delete-${w.id}`}
                          aria-disabled={used > 0}
                          disabled={!!walletPending.byId[w.id]}
                          aria-busy={!!walletPending.byId[w.id]}
                          onClick={() => void remove(w.id)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60 ${
                            used > 0 ? "text-on-surface-variant/40" : "text-error"
                          }`}
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </>
                    )}
                  </div>
                  {message ? (
                    <p
                      role="alert"
                      data-testid={`fund-source-error-${w.id}`}
                      className="m-0 text-[11px] font-semibold text-error"
                    >
                      {message}
                    </p>
                  ) : null}
                </li>
              );
            })
          ) : (
            <li
              data-testid="fund-source-empty"
              className="py-4 text-center text-[12px] text-on-surface-variant/70"
            >
              {copy.fundSourcesEmpty}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

type CategorySort = "name-asc" | "name-desc" | "most-used";

const CATEGORY_SORTS: CategorySort[] = ["name-asc", "name-desc", "most-used"];

/** Manage user-owned transaction categories (empty by default). */
function CategorySheet({ onClose }: { onClose: () => void }) {
  const {
    language,
    categories,
    addCategory,
    renameCategory,
    deleteCategory,
    categoryUsage,
    wallets,
  } = useApp();
  const copy = t(language);
  const ref = useModalA11y<HTMLDivElement>(true, onClose);
  const [type, setType] = useState<TxType>("expense");
  const [name, setName] = useState("");
  const [walletId, setWalletId] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CategorySort>("name-asc");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = categories.filter(
      (c) => c.type === type && (!q || c.name.toLowerCase().includes(q)),
    );
    return rows.sort((a, b) => {
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "most-used") {
        const diff = categoryUsage(b.id) - categoryUsage(a.id);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [categories, categoryUsage, query, sort, type]);

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setEditingName(current);
    setRowError(null);
  };

  const announce = (message: string, ok: boolean) => {
    setStatus(message);
    if (ok) toast.success(message);
    else toast.error(message);
  };

  const commitRename = (id: string) => {
    const ok = renameCategory(id, editingName);
    if (!ok) {
      setRowError({ id, message: copy.invalidCategory });
      announce(copy.invalidCategory, false);
      return;
    }
    setEditingId(null);
    setEditingName("");
    setRowError(null);
    announce(copy.categoryRenamed, true);
  };

  const removeCategory = (id: string) => {
    if (categoryUsage(id) > 0 || !deleteCategory(id)) {
      setRowError({ id, message: copy.categoryInUse });
      announce(copy.categoryInUse, false);
      return;
    }
    setRowError(null);
    announce(copy.categoryDeleted, true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addCategory({ name, type, ...(walletId ? { walletId } : {}) });
    if (!ok) return setError(copy.invalidCategory);
    setName("");
    setError(undefined);
  };


  return (
    <div
      className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={copy.categories}
        data-testid="category-sheet"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[26px] border-t border-outline-variant/20 bg-surface-container-high p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-2xl"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-3 block h-1 w-10 rounded-full bg-outline-variant/60"
        />
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-title text-on-surface">{copy.categories}</h3>
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div
          className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-surface-container p-1"
          role="tablist"
          aria-label={copy.categories}
        >
          {(["income", "expense"] as TxType[]).map((tp) => (
            <button
              key={tp}
              type="button"
              role="tab"
              aria-selected={type === tp}
              onClick={() => setType(tp)}
              className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                type === tp ? "bg-primary-container/40 text-primary" : "text-on-surface-variant"
              }`}
            >
              {tp === "income" ? copy.income : copy.expense}
            </button>
          ))}
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={submit} noValidate>
          <label className="flex flex-col gap-1">
            <span className="text-meta text-on-surface-variant/80">{copy.categoryName}</span>
            <input
              value={name}
              maxLength={24}
              data-testid="category-name"
              aria-invalid={!!error}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-meta text-on-surface-variant/80">{copy.categoryScope}</span>
            <select
              value={walletId}
              data-testid="category-scope"
              onChange={(e) => setWalletId(e.target.value)}
              className="h-12 rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <option value="">{copy.allAccounts}</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {`${w.name} · ${WALLET_TYPE_LABEL[w.type]}`}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p role="alert" className="m-0 text-[11px] font-semibold text-error">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            data-testid="category-submit"
            className="gradient-primary h-12 rounded-full text-[13px] font-bold text-on-primary-container transition-transform active:scale-95"
          >
            {copy.addCategory}
          </button>
        </form>

        <p aria-live="polite" className="sr-only">
          {status}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="sr-only">{copy.searchCategories}</span>
            <input
              type="search"
              value={query}
              maxLength={40}
              placeholder={copy.searchCategories}
              aria-label={copy.searchCategories}
              data-testid="category-search"
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-outline-variant/30 bg-surface-container px-4 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="sr-only">{copy.sortLabel}</span>
            <select
              value={sort}
              aria-label={copy.sortLabel}
              data-testid="category-sort"
              onChange={(e) => setSort(e.target.value as CategorySort)}
              className="h-11 rounded-2xl border border-outline-variant/30 bg-surface-container px-3 text-[13px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {CATEGORY_SORTS.map((option) => (
                <option key={option} value={option}>
                  {option === "name-asc"
                    ? copy.sortNameAsc
                    : option === "name-desc"
                      ? copy.sortNameDesc
                      : copy.sortMostUsed}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="mt-3 list-none rounded-2xl bg-surface-container px-4 py-1">
          {list.length ? (
            list.map((c) => {
              const scope = c.walletId
                ? wallets.find((w) => w.id === c.walletId)?.name ?? copy.allAccounts
                : copy.allAccounts;
              const used = categoryUsage(c.id);
              const editing = editingId === c.id;
              const message = rowError && rowError.id === c.id ? rowError.message : null;
              return (
                <li
                  key={c.id}
                  data-testid={`category-item-${c.id}`}
                  className="flex flex-col gap-2 border-b border-outline-variant/20 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <input
                        autoFocus
                        value={editingName}
                        maxLength={24}
                        aria-label={`${copy.renameCategory} ${c.name}`}
                        aria-invalid={!!message}
                        data-testid={`category-rename-input-${c.id}`}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename(c.id);
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingId(null);
                            setRowError(null);
                          }
                        }}
                        className="h-10 min-w-0 flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-high px-3 text-[14px] text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      />
                    ) : (
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-on-surface">
                          {c.name}
                        </span>
                        <span className="truncate text-[11px] text-on-surface-variant/80">
                          {`${scope} · ${used}`}
                        </span>
                      </span>
                    )}

                    {editing ? (
                      <>
                        <button
                          type="button"
                          aria-label={copy.save}
                          data-testid={`category-rename-save-${c.id}`}
                          onClick={() => commitRename(c.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container/40 text-primary focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="check" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          aria-label={copy.cancel}
                          onClick={() => {
                            setEditingId(null);
                            setRowError(null);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="close" className="text-[18px]" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          aria-label={`${copy.rename} ${c.name}`}
                          data-testid={`category-rename-${c.id}`}
                          onClick={() => startRename(c.id, c.name)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          aria-label={`${copy.delete} ${c.name}`}
                          data-testid={`category-delete-${c.id}`}
                          aria-disabled={used > 0}
                          onClick={() => removeCategory(c.id)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface-variant focus-visible:ring-2 focus-visible:ring-primary/60 ${
                            used > 0 ? "text-on-surface-variant/40" : "text-error"
                          }`}
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </>
                    )}
                  </div>
                  {message ? (
                    <p
                      role="alert"
                      data-testid={`category-error-${c.id}`}
                      className="m-0 text-[11px] font-semibold text-error"
                    >
                      {message}
                    </p>
                  ) : null}
                </li>
              );
            })
          ) : (
            <li
              data-testid="category-empty"
              className="py-4 text-center text-[12px] text-on-surface-variant/70"
            >
              {query.trim() ? copy.noCategoryResults : copy.categoriesEmpty}
            </li>
          )}
        </ul>

      </div>
    </div>
  );
}
