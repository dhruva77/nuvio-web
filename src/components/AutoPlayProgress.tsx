import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { t } from "../lib/i18n.ts";

export type AutoPlayStage = "finding" | "choosing";

/**
 * What the source sheet shows while autoplay is choosing for you.
 *
 * It used to show the source list itself, filling in as addons answered, and
 * then play one of them a few seconds later. To anyone not expecting that, a
 * list of sources reads as a question — "pick one" — and the wait before the
 * pick reads as autoplay not working. So the list stays out of the way and
 * the steps say what is happening instead, ending in the player's own
 * "Starting stream".
 */
export function AutoPlayProgress({
  stage,
  answered,
  total,
  found,
  deadline,
  onManual,
}: {
  stage: AutoPlayStage;
  /** Addons that have answered, out of `total`. */
  answered: number;
  total: number;
  /** Sources found so far. */
  found: number;
  /** When the auto-pick timer runs out, if there is one. */
  deadline: number | null;
  onManual(): void;
}) {
  const seconds = useCountdown(deadline);
  const steps: Array<{ label: string; detail: string; state: "done" | "active" | "next" }> = [
    {
      label: t("autoplay.finding"),
      detail: t("autoplay.findingDetail", {
        answered: Math.min(answered, total),
        total,
        found,
      }),
      state: stage === "finding" ? "active" : "done",
    },
    {
      label: t("autoplay.choosing"),
      detail:
        stage === "finding" && seconds !== null && seconds > 0
          ? t("autoplay.choosingIn", { seconds })
          : t("autoplay.choosingWait"),
      state: stage === "choosing" ? "active" : "next",
    },
    {
      label: t("autoplay.starting"),
      detail: t("autoplay.startingDetail"),
      state: "next",
    },
  ];
  return (
    <div className="autoplay-progress" role="status" aria-live="polite">
      <ol>
        {steps.map((step) => (
          <li key={step.label} className={`is-${step.state}`}>
            <span className="autoplay-mark" aria-hidden="true">
              {step.state === "done" ? (
                <Check />
              ) : step.state === "active" ? (
                <i className="mini-spinner" />
              ) : null}
            </span>
            <span>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
          </li>
        ))}
      </ol>
      <p>{t("autoplay.note")}</p>
      <button type="button" className="autoplay-manual" onClick={onManual}>
        {t("autoplay.manual")}
      </button>
    </div>
  );
}

/** Whole seconds left until `deadline`, ticking; null without one. */
function useCountdown(deadline: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (deadline === null) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}
