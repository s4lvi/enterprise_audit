import Link from "next/link";

export type CalendarEvent = {
  id: string;
  scheduled_at: string;
  chapter_name: string | null;
  assignee_name: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftMonth(yearMonth: string, by: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y!, m! - 1 + by, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function buildGrid(yearMonth: string): { days: Date[]; firstOfMonth: Date } {
  const [y, m] = yearMonth.split("-").map(Number);
  const firstOfMonth = new Date(y!, m! - 1, 1);
  const lastOfMonth = new Date(y!, m!, 0);
  const startOfGrid = new Date(firstOfMonth);
  startOfGrid.setDate(firstOfMonth.getDate() - firstOfMonth.getDay()); // back to Sunday
  const endOfGrid = new Date(lastOfMonth);
  endOfGrid.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));
  const days: Date[] = [];
  for (let d = new Date(startOfGrid); d <= endOfGrid; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return { days, firstOfMonth };
}

export function ScheduleCalendar({
  yearMonth,
  events,
}: {
  yearMonth: string;
  events: CalendarEvent[];
}) {
  const { days, firstOfMonth } = buildGrid(yearMonth);
  const monthLabel = firstOfMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const todayKey = localDayKey(new Date());

  // Group events by local day key
  const byDay = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = localDayKey(new Date(ev.scheduled_at));
    const list = byDay.get(key) ?? [];
    list.push(ev);
    byDay.set(key, list);
  }
  // Sort each day's events by time
  for (const list of byDay.values()) {
    list.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  }

  const prevMonth = shiftMonth(yearMonth, -1);
  const nextMonth = shiftMonth(yearMonth, 1);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base">{monthLabel}</h2>
        <div className="flex gap-1">
          <Link
            href={`/schedule?view=calendar&month=${prevMonth}`}
            className="btn-cut bg-white/10 px-3 py-1 text-xs font-black tracking-widest uppercase hover:bg-white/20"
          >
            ←
          </Link>
          <Link
            href={`/schedule?view=calendar`}
            className="btn-cut bg-white/10 px-3 py-1 text-xs font-black tracking-widest uppercase hover:bg-white/20"
          >
            Today
          </Link>
          <Link
            href={`/schedule?view=calendar&month=${nextMonth}`}
            className="btn-cut bg-white/10 px-3 py-1 text-xs font-black tracking-widest uppercase hover:bg-white/20"
          >
            →
          </Link>
        </div>
      </div>

      <div className="card-cut overflow-hidden border border-white/10">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[10px] font-bold tracking-widest text-white/50 uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const key = localDayKey(d);
            const inMonth = d.getMonth() === firstOfMonth.getMonth();
            const isToday = key === todayKey;
            const dayEvents = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={`min-h-24 border-b border-r border-white/10 p-1.5 ${
                  inMonth ? "bg-transparent" : "bg-black/30"
                } ${isToday ? "outline outline-1 outline-brand-primary" : ""}`}
              >
                <div
                  className={`mb-1 text-xs font-bold ${
                    inMonth ? "text-white/60" : "text-white/20"
                  } ${isToday ? "text-brand-primary" : ""}`}
                >
                  {d.getDate()}
                </div>
                <ul className="space-y-1">
                  {dayEvents.map((ev) => {
                    const time = new Date(ev.scheduled_at).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    return (
                      <li key={ev.id}>
                        <Link
                          href={`/schedule/${ev.id}`}
                          className="block truncate rounded-sm bg-brand-primary/80 px-1 py-0.5 text-[10px] font-bold tracking-wide text-white hover:bg-brand-primary"
                          title={`${time} · ${ev.chapter_name ?? "—"} · ${ev.assignee_name ?? "—"}`}
                        >
                          {time} {ev.chapter_name ?? ""}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
