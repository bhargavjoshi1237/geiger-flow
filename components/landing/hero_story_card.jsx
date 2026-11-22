import { Check } from "lucide-react";
import { StatusIcon } from "@/components/internal/screens/it/icons";
import styles from "./hero_story_card.module.css";

// APOL-2 from the demo project the playground below loads (supabase/demo/fixtures.js); each check is a step from its comment thread.
const CHECKS = [
  ["Pick token names in APOL-12", true],
  ["Check contrast on the dark pair", true],
  ["Land the token migration", false],
];

// Hero artwork: the issue the playground opens on, written up on a ruled index card and pinned to the wall.
export default function HeroStoryCard() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.story}>
        <span className={styles.pin} />
        <div className={styles.head}>
          <span><StatusIcon status="in_progress" style={{ color: "currentColor" }} />APOL-2</span>
          <span className={styles.estimate}>5h</span>
        </div>
        <div className={styles.body}>
          <div className={styles.title}>Token values drift between light and dark</div>
          <ul className={styles.checks}>
            {CHECKS.map(([text, done]) => (
              <li key={text} data-done={done || undefined}>
                <span className={styles.box}>{done ? <Check size={9} strokeWidth={3.5} /> : null}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <div className={styles.foot}>
            <span>Ada · Tomás</span>
            <span>Due in 2 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
