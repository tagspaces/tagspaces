// utils/formatLocalTime.ts
type Input = string | number | Date | null | undefined;

function toDate(input: Input): Date | null {
  if (input === null || input === undefined) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getIanaTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function getOffsetString(d: Date): string {
  // minutes ahead of UTC
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const hh = pad(Math.floor(abs / 60));
  const mm = pad(abs % 60);
  return `${sign}${hh}:${mm}`;
}

function formatIsoLikeLocal(d: Date): string {
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function getShortZoneAbbr(d: Date, ianaTZ: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: ianaTZ,
      timeZoneName: 'short',
    }).formatToParts(d);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : null;
  } catch {
    return null;
  }
}

export interface FormatOpts {
  /**
   * If true, returns "YYYY-MM-DD HH:mm:ss" style (default true).
   * If false, returns locale-aware string equivalent to toLocaleString().
   */
  isoLike?: boolean;
  /** include numeric offset like +03:00 (default true) */
  withOffset?: boolean;
  /**
   * include timezone identifier or abbreviation (default true).
   * - if isoLike === true -> includes IANA name (Europe/Sofia) + abbrev (EEST) when available
   * - if isoLike === false -> timeZoneName is used by Intl
   */
  withZoneName?: boolean;
  /** locale used for localized formatting (defaults to user locale) */
  locale?: string | undefined;
}

export function formatTimestampLocal(
  input: Input,
  opts: FormatOpts = {},
): string {
  const {
    isoLike = true,
    withOffset = true,
    withZoneName = true,
    locale,
  } = opts;
  const d = toDate(input);
  if (!d) return ' ';

  const iana = getIanaTimeZone(); // e.g. "Europe/Sofia"
  const offset = getOffsetString(d); // e.g. "+03:00"
  if (!isoLike) {
    // localized style (uses Intl)
    const fmtOpts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    if (withZoneName) fmtOpts.timeZoneName = 'short';
    const s = d.toLocaleString(locale, { ...fmtOpts, timeZone: iana });
    return withOffset ? `${s} ${offset}` : s;
  }

  // ISO-like: YYYY-MM-DD HH:mm:ss + optional zone/abbr/offset
  const base = formatIsoLikeLocal(d); // e.g. "2025-09-23 18:04:05"
  if (!withZoneName) return withOffset ? `${base} ${offset}` : base;

  // include both IANA name and short abbreviation when possible
  const abbr = getShortZoneAbbr(d, iana); // e.g. "EEST" or "GMT+3"
  // prefer: "YYYY-MM-DD HH:mm:ss Europe/Sofia EEST +03:00"
  const zonePart = abbr ? `${iana} ${abbr}` : iana;
  return withOffset ? `${base} ${zonePart} ${offset}` : `${base} ${zonePart}`;
}
