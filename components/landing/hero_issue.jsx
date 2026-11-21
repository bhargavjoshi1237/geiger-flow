import { Check } from "lucide-react";
import Logo from "@geiger/ui/logo";
import styles from "./hero_issue.module.css";

// Hero artwork: APOL-2 from the demo project the playground below loads (supabase/demo/fixtures.js), just moved to review.
const SUB_ISSUES = [
  ["APOL-6", "Document the spacing scale"],
  ["APOL-12", "Token naming review"],
];

// Linear-style priority glyph: three bars, all lit for Urgent.
function UrgentBars() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className={styles.priorityBars}>
      <rect x="1" y="8" width="3" height="5" rx="1" />
      <rect x="5.5" y="5" width="3" height="8" rx="1" />
      <rect x="10" y="2" width="3" height="11" rx="1" />
    </svg>
  );
}

export default function HeroIssue() {
  return (
    <div className={styles.scene} aria-hidden="true">
      {/* The next issue in the backlog, peeking out behind */}
      <div className={styles.back}>
        <div className={styles.backStub}>
          <div><small>APOL-1 · Todo</small><strong>Sidebar collapses at tablet breakpoints</strong></div>
          <span className={styles.avatar}>TF</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.key}><Logo size={16} />APOL-2</span>
          <span className={styles.priority}><UrgentBars />Urgent</span>
        </div>

        <div className={styles.title}>Token values drift between light and dark</div>
        <div className={styles.labels}>
          <span className={styles.type}>Bug</span>
          <span>tokens</span>
          <span>a11y</span>
        </div>

        <dl className={styles.fields}>
          <div><dt>Status</dt><dd><span className={styles.statusDot} />In Review</dd></div>
          <div>
            <dt>Assignees</dt>
            <dd className={styles.avatars}><span className={styles.avatar}>AW</span><span className={styles.avatar}>TF</span></dd>
          </div>
          <div><dt>Due</dt><dd>In 2 days</dd></div>
          <div><dt>Estimate</dt><dd>5h</dd></div>
        </dl>

        <div className={styles.subIssues}>
          <div className={styles.subHeader}><span>Sub-issues</span><span>2 / 2</span></div>
          <ul>
            {SUB_ISSUES.map(([key, title]) => (
              <li key={key}><span className={styles.check}><Check size={10} strokeWidth={3} /></span><code>{key}</code><span>{title}</span></li>
            ))}
          </ul>
        </div>

        <div className={styles.objective}>
          <div><span>Ship the Apollo design system v2</span><span>62%</span></div>
          <span className={styles.objectiveBar}><span /></span>
        </div>

        <div className={styles.stamp}>
          <strong><span className={styles.stampDot} />Moved to In Review</strong>
          <span>Tomás · just now</span>
        </div>
      </div>
    </div>
  );
}
