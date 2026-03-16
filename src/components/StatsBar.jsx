// src/components/StatsBar.jsx
import { useI18n } from "../i18n/index.jsx";
import { STATS } from "../constants/config";

export default function StatsBar() {
  const { t } = useI18n();
  const translatedStats = [
    { num: STATS[0].num, label: t("stat_quality") },
    { num: STATS[1].num, label: t("stat_bitrate") },
    { num: STATS[2].num, label: t("stat_signup")  },
    { num: STATS[3].num, label: t("stat_always")  },
  ];
  return (
    <div className="stats-row">
      {translatedStats.map(s => (
        <div className="stat" key={s.label}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}