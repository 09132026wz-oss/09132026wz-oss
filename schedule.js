/*
 * Release schedule for the translation pages.
 *
 * Each section stays locked (dimmed on the menu, unreadable in the reader)
 * until its opening time passes, then every page in it opens at once. Edit
 * SECTIONS below to match the run of show.
 *
 * Times are venue wall-clock times, written as "YYYY-MM-DDTHH:MM" on a 24-hour
 * clock, and are anchored to VENUE_UTC_OFFSET so the site opens at the same
 * real moment no matter what time zone a guest's phone thinks it is in.
 *
 * A page not listed in any section is always open.
 *
 * Rehearsal helpers, added to any URL:
 *   ?unlock=all              unlock everything, ignoring the schedule
 *   ?at=2026-09-12T13:30     pretend it is this venue time right now
 *
 * Note: this hides content in the UI only. The markdown files stay reachable by
 * direct URL, so treat the schedule as stage management, not as a secret.
 */

// eslint-disable-next-line no-unused-vars
const WeddingSchedule = (() => {
  // Venue UTC offset. -07:00 is US Pacific in September (PDT); -04:00 is US
  // Eastern (EDT), +09:00 is Korea, +08:00 is China.
  const VENUE_UTC_OFFSET = "-07:00";

  const SECTIONS = [
    {
      opensAt: "2026-09-12T11:20",
      pages: ["grooms-letter", "brides-letter", "exchange-of-vows"],
      lockedLabel: {
        en: "Opens once the ceremony begins",
        zh: "仪式开始后开放",
        ko: "예식이 시작되면 공개됩니다"
      }
    },
    {
      opensAt: "2026-09-12T13:25",
      pages: [
        "grooms-fathers-speech",
        "grooms-phd-advisors-speech",
        "brides-brothers-speech",
        "brides-friend-esthers-speech"
      ],
      lockedLabel: {
        en: "Opens once the reception begins",
        zh: "晚宴开始后开放",
        ko: "피로연이 시작되면 공개됩니다"
      }
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const unlockAll = params.get("unlock") === "all";
  const simulatedNow = toDate(params.get("at"));

  function toDate(wallClock) {
    if (!wallClock) {
      return null;
    }

    const parsed = new Date(`${wallClock}:00${VENUE_UTC_OFFSET}`);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function now() {
    return simulatedNow || new Date();
  }

  function sectionFor(page) {
    return SECTIONS.find((section) => section.pages.includes(page)) || null;
  }

  function releaseAt(page) {
    const section = sectionFor(page);

    return section ? toDate(section.opensAt) : null;
  }

  function isUnlocked(page) {
    const release = releaseAt(page);

    return unlockAll || !release || now() >= release;
  }

  /* What a locked card says in place of "Open Translation". Empty once open. */
  function lockedLabel(page, language) {
    const section = sectionFor(page);

    if (!section || isUnlocked(page)) {
      return "";
    }

    return section.lockedLabel[language] || section.lockedLabel.en;
  }

  /* Carries ?unlock / ?at across links so a rehearsal run stays in that mode. */
  function overrideQuery() {
    const carried = new URLSearchParams();

    if (unlockAll) {
      carried.set("unlock", "all");
    }

    if (params.get("at")) {
      carried.set("at", params.get("at"));
    }

    const query = carried.toString();

    return query ? `&${query}` : "";
  }

  /* Same overrides, for a link that has no query string of its own yet. */
  function overrideSearch() {
    return overrideQuery().replace(/^&/, "?");
  }

  return { isUnlocked, releaseAt, lockedLabel, overrideQuery, overrideSearch };
})();
