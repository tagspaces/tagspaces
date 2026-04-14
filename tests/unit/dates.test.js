import {
  isDateTimeTag,
  isYear,
  isYearPeriod,
  isYearMonth,
  isYearMonthPeriod,
  isYearMonthDay,
  isYearMonthDayPeriod,
  isYearMonthDayHour,
  isYearMonthDayHourPeriod,
  isYearMonthDayHourMin,
  isYearMonthDayHourMinPeriod,
  isYearMonthDayHourMinSec,
  isYearMonthDayHourMinSecPeriod,
  getDaysInMonth,
} from '-/utils/dates';
import { describe, expect, test } from '@playwright/test';

describe('Date Utilities', () => {
  describe('getDaysInMonth', () => {
    test('January has 31 days', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31);
    });

    test('February has 28 days in non-leap year', () => {
      expect(getDaysInMonth(2025, 2)).toBe(28);
    });

    test('February has 29 days in leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    test('April has 30 days', () => {
      expect(getDaysInMonth(2026, 4)).toBe(30);
    });
  });

  describe('isYear', () => {
    test('valid year 2025', () => {
      expect(isYear('2025')).toBe(true);
    });

    test('valid year 2000', () => {
      expect(isYear('2000')).toBe(true);
    });

    test('rejects non-numeric', () => {
      expect(isYear('abcd')).toBe(false);
    });

    test('rejects 5-digit number', () => {
      expect(isYear('20251')).toBe(false);
    });
  });

  describe('isYearPeriod', () => {
    test('valid period 2015-2017', () => {
      expect(isYearPeriod('2015-2017')).toBe(true);
    });

    test('rejects single year', () => {
      expect(isYearPeriod('2015')).toBe(false);
    });
  });

  describe('isYearMonth', () => {
    test('valid 202512', () => {
      expect(isYearMonth('202512')).toBe(true);
    });

    test('valid 202501 (January)', () => {
      expect(isYearMonth('202501')).toBe(true);
    });

    test('rejects month 00', () => {
      expect(isYearMonth('202500')).toBe(false);
    });

    test('rejects month 13', () => {
      expect(isYearMonth('202513')).toBe(false);
    });

    test('rejects month 19', () => {
      expect(isYearMonth('202519')).toBe(false);
    });
  });

  describe('isYearMonthPeriod', () => {
    test('valid 201512-201604', () => {
      expect(isYearMonthPeriod('201512-201604')).toBe(true);
    });

    test('rejects invalid from-month 201500-201604', () => {
      expect(isYearMonthPeriod('201500-201604')).toBe(false);
    });

    test('rejects invalid to-month 201512-201613', () => {
      expect(isYearMonthPeriod('201512-201613')).toBe(false);
    });
  });

  describe('isYearMonthDay', () => {
    test('valid 20251223', () => {
      expect(isYearMonthDay('20251223')).toBe(true);
    });

    test('valid 20260101 (Jan 1)', () => {
      expect(isYearMonthDay('20260101')).toBe(true);
    });

    test('valid 20260228 (Feb 28 non-leap)', () => {
      expect(isYearMonthDay('20260228')).toBe(true);
    });

    test('valid 20240229 (Feb 29 leap year)', () => {
      expect(isYearMonthDay('20240229')).toBe(true);
    });

    test('rejects 20250229 (Feb 29 non-leap year)', () => {
      expect(isYearMonthDay('20250229')).toBe(false);
    });

    test('rejects day 00', () => {
      expect(isYearMonthDay('20260300')).toBe(false);
    });

    test('rejects day 32 in January', () => {
      expect(isYearMonthDay('20260132')).toBe(false);
    });

    test('rejects day 34 (20260334)', () => {
      expect(isYearMonthDay('20260334')).toBe(false);
    });

    test('rejects month 13', () => {
      expect(isYearMonthDay('20261301')).toBe(false);
    });

    test('rejects day 31 in April (30-day month)', () => {
      expect(isYearMonthDay('20260431')).toBe(false);
    });

    test('rejects month 00', () => {
      expect(isYearMonthDay('20260001')).toBe(false);
    });
  });

  describe('isYearMonthDayPeriod', () => {
    test('valid 20151223-20160223', () => {
      expect(isYearMonthDayPeriod('20151223-20160223')).toBe(true);
    });

    test('rejects invalid from-date 20260334-20260401', () => {
      expect(isYearMonthDayPeriod('20260334-20260401')).toBe(false);
    });

    test('rejects invalid to-date 20260301-20260334', () => {
      expect(isYearMonthDayPeriod('20260301-20260334')).toBe(false);
    });
  });

  describe('isYearMonthDayHour', () => {
    test('valid 20251223~01', () => {
      expect(isYearMonthDayHour('20251223~01')).toBe(true);
    });

    test('valid with T separator 20251223T14', () => {
      expect(isYearMonthDayHour('20251223T14')).toBe(true);
    });

    test('rejects invalid date 20260334~12', () => {
      expect(isYearMonthDayHour('20260334~12')).toBe(false);
    });
  });

  describe('isYearMonthDayHourPeriod', () => {
    test('valid 20190712~17-20190712~17', () => {
      expect(isYearMonthDayHourPeriod('20190712~17-20190712~17')).toBe(true);
    });

    test('rejects invalid from-date 20260334~17-20260401~17', () => {
      expect(isYearMonthDayHourPeriod('20260334~17-20260401~17')).toBe(false);
    });

    test('rejects invalid to-date 20260301~17-20260334~17', () => {
      expect(isYearMonthDayHourPeriod('20260301~17-20260334~17')).toBe(false);
    });
  });

  describe('isYearMonthDayHourMin', () => {
    test('valid 20251223~0112', () => {
      expect(isYearMonthDayHourMin('20251223~0112')).toBe(true);
    });

    test('valid with T separator 20251223T0112', () => {
      expect(isYearMonthDayHourMin('20251223T0112')).toBe(true);
    });

    test('rejects invalid date 20260334~0112', () => {
      expect(isYearMonthDayHourMin('20260334~0112')).toBe(false);
    });
  });

  describe('isYearMonthDayHourMinPeriod', () => {
    test('valid 20190712~1740-20190712~1740', () => {
      expect(isYearMonthDayHourMinPeriod('20190712~1740-20190712~1740')).toBe(
        true,
      );
    });

    test('rejects invalid from-date', () => {
      expect(
        isYearMonthDayHourMinPeriod('20260334~1740-20260401~1740'),
      ).toBe(false);
    });

    test('rejects invalid to-date', () => {
      expect(
        isYearMonthDayHourMinPeriod('20260301~1740-20260334~1740'),
      ).toBe(false);
    });
  });

  describe('isYearMonthDayHourMinSec', () => {
    test('valid 20251223~011358', () => {
      expect(isYearMonthDayHourMinSec('20251223~011358')).toBe(true);
    });

    test('valid with T separator 20251223T011358', () => {
      expect(isYearMonthDayHourMinSec('20251223T011358')).toBe(true);
    });

    test('rejects invalid date 20260334~011358', () => {
      expect(isYearMonthDayHourMinSec('20260334~011358')).toBe(false);
    });
  });

  describe('isYearMonthDayHourMinSecPeriod', () => {
    test('valid 20190712~174031-20190712~174031', () => {
      expect(
        isYearMonthDayHourMinSecPeriod('20190712~174031-20190712~174031'),
      ).toBe(true);
    });

    test('rejects invalid from-date', () => {
      expect(
        isYearMonthDayHourMinSecPeriod('20260334~174031-20260401~174031'),
      ).toBe(false);
    });

    test('rejects invalid to-date', () => {
      expect(
        isYearMonthDayHourMinSecPeriod('20260301~174031-20260334~174031'),
      ).toBe(false);
    });
  });

  describe('isDateTimeTag', () => {
    test('recognizes year', () => {
      expect(isDateTimeTag('2025')).toBe(true);
    });

    test('recognizes year-month', () => {
      expect(isDateTimeTag('202503')).toBe(true);
    });

    test('recognizes year-month-day', () => {
      expect(isDateTimeTag('20250315')).toBe(true);
    });

    test('recognizes datetime with tilde', () => {
      expect(isDateTimeTag('20250315~1430')).toBe(true);
    });

    test('recognizes datetime with T', () => {
      expect(isDateTimeTag('20250315T143059')).toBe(true);
    });

    test('recognizes year period', () => {
      expect(isDateTimeTag('2020-2025')).toBe(true);
    });

    test('rejects invalid day 34', () => {
      expect(isDateTimeTag('20260334')).toBe(false);
    });

    test('rejects Feb 29 in non-leap year', () => {
      expect(isDateTimeTag('20250229')).toBe(false);
    });

    test('accepts Feb 29 in leap year', () => {
      expect(isDateTimeTag('20240229')).toBe(true);
    });

    test('rejects month 13', () => {
      expect(isDateTimeTag('20261301')).toBe(false);
    });

    test('rejects month 00', () => {
      expect(isDateTimeTag('202600')).toBe(false);
    });

    test('rejects invalid date in datetime format', () => {
      expect(isDateTimeTag('20260334~1430')).toBe(false);
    });

    test('rejects non-date string', () => {
      expect(isDateTimeTag('viewer')).toBe(false);
    });

    test('rejects alphanumeric', () => {
      expect(isDateTimeTag('abc123')).toBe(false);
    });

    test('rejects April 31', () => {
      expect(isDateTimeTag('20260431')).toBe(false);
    });

    test('accepts April 30', () => {
      expect(isDateTimeTag('20260430')).toBe(true);
    });

    test('rejects Jun 31', () => {
      expect(isDateTimeTag('20260631')).toBe(false);
    });

    test('accepts Dec 31', () => {
      expect(isDateTimeTag('20261231')).toBe(true);
    });
  });
});
