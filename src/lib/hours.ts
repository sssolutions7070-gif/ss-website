import { company } from "@/data/company";

const HOURS = company.hours ?? { days: [1, 2, 3, 4, 5, 6], start: 10, end: 20 };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Current weekday (0=Sun) and fractional hour in India Standard Time. */
export function nowIST(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: DAY_NAMES.indexOf(get("weekday")),
    hour: Number(get("hour")) + Number(get("minute")) / 60,
  };
}

export function isOpen(d = new Date()) {
  const { day, hour } = nowIST(d);
  return HOURS.days.includes(day) && hour >= HOURS.start && hour < HOURS.end;
}

const fmtHour = (h: number) => {
  const hh = Math.floor(h) % 12 || 12;
  return `${hh} ${h < 12 ? "AM" : "PM"}`;
};

/** "Replies by 10 AM tomorrow" style message for when we're offline. */
export function nextOpenLabel(d = new Date()) {
  const { day, hour } = nowIST(d);
  if (HOURS.days.includes(day) && hour < HOURS.start) return `Replies by ${fmtHour(HOURS.start)} today`;
  for (let i = 1; i <= 7; i++) {
    const nd = (day + i) % 7;
    if (HOURS.days.includes(nd)) return `Replies by ${fmtHour(HOURS.start)} ${i === 1 ? "tomorrow" : DAY_NAMES[nd]}`;
  }
  return "We'll reply soon";
}

/** Next `count` working days as { date, label } in IST. */
export function nextWorkingDays(count: number, d = new Date()) {
  const out: { iso: string; label: string; day: string }[] = [];
  const base = new Date(d.getTime());
  for (let i = 1; out.length < count && i < 21; i++) {
    const nd = new Date(base.getTime() + i * 86400000);
    const { day } = nowIST(nd);
    if (!HOURS.days.includes(day)) continue;
    const label = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" }).format(nd);
    const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(nd);
    out.push({ iso, label, day: DAY_NAMES[day] });
  }
  return out;
}

export function timeSlots() {
  const slots: string[] = [];
  for (let h = HOURS.start; h < HOURS.end; h += 1) {
    slots.push(fmtHour(h).replace(" ", ":00 "));
    if (h + 0.5 < HOURS.end) slots.push(`${Math.floor(h) % 12 || 12}:30 ${h < 12 ? "AM" : "PM"}`);
  }
  return slots;
}

export { HOURS };
