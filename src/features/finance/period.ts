const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value?: string) {
  if (!value || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function vietnamDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function financePeriod(rawFrom?: string, rawTo?: string) {
  const today = vietnamDate();
  const defaultFrom = `${today.slice(0, 7)}-01`;
  const from = validDate(rawFrom) ? rawFrom! : defaultFrom;
  const to = validDate(rawTo) ? rawTo! : today;
  const safeFrom = from <= to ? from : to;
  const safeTo = from <= to ? to : from;
  return { from: safeFrom, to: safeTo, label: `${safeFrom.split("-").reverse().join("/")} – ${safeTo.split("-").reverse().join("/")}` };
}

export function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function dateRange(from: string, to: string) {
  const dates: string[] = [];
  for (let current = from; current <= to && dates.length < 370; current = nextDate(current)) dates.push(current);
  return dates;
}
