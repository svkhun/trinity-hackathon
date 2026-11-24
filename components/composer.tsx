"use client";
import { scenarios } from "@/lib/data";
import { copy, type Locale } from "@/lib/i18n";

/** Scenario tabs + text input + submit. Shared by Overview and Fact Check. */
export function ComposerForm({
  locale,
  draft,
  setDraft,
  analyze,
  busy,
  error,
}: {
  locale: Locale;
  draft: string;
  setDraft: (v: string) => void;
  analyze: () => void;
  busy: boolean;
  error: string;
}) {
  const t = copy[locale].overview;
  const names = copy[locale].scenarios;
  const selected = scenarios.find((s) => s.text === draft.trim());

  return (
    <>
      <div className="mc-scenario-tabs" role="group" aria-label={t.selectLabel}>
        {scenarios.map((s) => {
          const on = selected?.id === s.id;
          return (
            <button
              type="button"
              key={s.id}
              disabled={busy}
              aria-pressed={on}
              className={"mc-tab " + (on ? "active" : "")}
              onClick={() => setDraft(s.text)}
            >
              {names[s.id] ?? s.name}
            </button>
          );
        })}
        <button
          type="button"
          disabled={busy}
          aria-pressed={!selected}
          className={"mc-tab " + (!selected ? "active" : "")}
          onClick={() => {
            if (selected) setDraft("");
            document.getElementById("post")?.focus();
          }}
        >
          {t.customTab}
        </button>
      </div>

      <form
        className="mc-form"
        onSubmit={(e) => {
          e.preventDefault();
          analyze();
        }}
      >
        <label htmlFor="post" className="sr-only">
          {t.composerTitle}
        </label>
        <div className={"mc-sheet " + (error ? "invalid" : "")}>
          <textarea
            id="post"
            placeholder={t.placeholder}
            value={draft}
            disabled={busy}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "post-error post-count" : "post-count"}
          />
          <div className="mc-sheet-foot" id="post-count">
            {draft.length.toLocaleString()} / 3,000
          </div>
        </div>
        {error && (
          <p id="post-error" role="alert" className="mc-error">
            {error}
          </p>
        )}
        <div className="mc-action-row">
          <button type="submit" disabled={busy} className="mc-btn-primary">
            {busy ? t.submitting : t.submit}
          </button>
          <span className="mc-privacy-note">{t.privacy}</span>
        </div>
      </form>
    </>
  );
}
