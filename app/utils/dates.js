/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @flow
 */

/** Returns true if the input is one of the following formats:
 * 2015, 201402, 20220212, 20190230~12, 20190230~1245, 20190230~124612 */
export function isDateTimeTag(tagDate: string): boolean {
  return (
    isYear(tagDate) ||
    isYearPeriod(tagDate) ||
    isYearMonth(tagDate) ||
    isYearMonthPeriod(tagDate) ||
    isYearMonthDay(tagDate) ||
    isYearMonthDayPeriod(tagDate) ||
    isYearMonthDayHour(tagDate) ||
    isYearMonthDayHourPeriod(tagDate) ||
    isYearMonthDayHourMin(tagDate) ||
    isYearMonthDayHourMinPeriod(tagDate) ||
    isYearMonthDayHourMinSec(tagDate) ||
    isYearMonthDayHourMinSecPeriod(tagDate)
  );
}

/** Returns true if string is this format: 2015 */
export function isYear(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 2015-2017 */
export function isYearPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789]-[0123][0123456789][0123456789][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 201512 */
export function isYearMonth(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 201512-201604 */
export function isYearMonthPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789]-[0123][0123456789][0123456789][0123456789][01][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20151223 */
export function isYearMonthDay(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20151223-20160223 */
export function isYearMonthDayPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]-[0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20151223~01 */
export function isYearMonthDayHour(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20190712~17-20190712~17 */
export function isYearMonthDayHourPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789]-[0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20151223~0112 */
export function isYearMonthDayHourMin(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20190712~1740-20190712~1740 */
export function isYearMonthDayHourMinPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789]-[0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20151223~011358 */
export function isYearMonthDayHourMinSec(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789][0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns true if string is this format: 20190712~174031-20190712~174031 */
export function isYearMonthDayHourMinSecPeriod(tagDate: string): boolean {
  return /(^|\s)([0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789][0123456][0123456789]-[0123][0123456789][0123456789][0123456789][01][0123456789][0123][0123456789]~[0123456][0123456789][0123456][0123456789][0123456][0123456789])(\s|$)/.test(tagDate);
}

/** Returns the number of day in month, January = 1 -> 31 .. December = 12 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export const msInDay = 1000 * 60 * 60 * 24;

/** Extract the time period from string e.g. 201902 -> fromDate: 2019-01-01 00:00:00, toDate; 2019-01-31 23:59:59 */
export function extractTimePeriod(value: string): { fromDateTime: Date | null, toDateTime: Date | null} {
  let fromDateTime = null;
  let toDateTime = null;
  if (value.length && !/(^|\s)([0123456789])(\s|$)/.test(value.substr(0, 1))) {
    return { // Return if the first char is not a number, ignoring values starting with letters
      fromDateTime,
      toDateTime
    };
  }
  try {
    if (isYear(value)) {
      fromDateTime = new Date(value + '-01-01');
      toDateTime = new Date(value + '-12-31 23:59:59.999');
    } else if (isYearPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const toYear = value.substring(5, 9);
      fromDateTime = new Date(fromYear + '-01-01');
      toDateTime = new Date(toYear + '-12-31 23:59:59.999');
    } else if (isYearMonth(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      fromDateTime = new Date(year + '-' + month + '-01');
      toDateTime = new Date(year + '-' + month + '-' + getDaysInMonth(parseInt(year, 10), parseInt(month, 10)) + ' 23:59:59.999');
    } else if (isYearMonthPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const fromMonth = value.substring(4, 6);
      const toYear = value.substring(7, 11);
      const toMonth = value.substring(11, 13);
      fromDateTime = new Date(fromYear + '-' + fromMonth + '-01');
      toDateTime = new Date(toYear + '-' + toMonth + '-' + getDaysInMonth(parseInt(toYear, 10), parseInt(toMonth, 10)) + ' 23:59:59.999');
    } else if (isYearMonthDay(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      fromDateTime = new Date(year + '-' + month + '-' + day);
      toDateTime = new Date(year + '-' + month + '-' + day + ' 23:59:59.999');
    } else if (isYearMonthDayPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const fromMonth = value.substring(4, 6);
      const fromDay = value.substring(6, 8);
      const toYear = value.substring(9, 13);
      const toMonth = value.substring(13, 15);
      const toDay = value.substring(15, 17);
      fromDateTime = new Date(fromYear + '-' + fromMonth + '-' + fromDay);
      toDateTime = new Date(toYear + '-' + toMonth + '-' + toDay + ' 23:59:59.999');
    } else if (isYearMonthDayHour(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(9, 11);
      fromDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':00:00');
      toDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':59:59.999');
    } else if (isYearMonthDayHourPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const fromMonth = value.substring(4, 6);
      const fromDay = value.substring(6, 8);
      const fromHour = value.substring(9, 11);
      const toYear = value.substring(12, 16);
      const toMonth = value.substring(16, 18);
      const toDay = value.substring(18, 20);
      const toHour = value.substring(21, 23);
      fromDateTime = new Date(fromYear + '-' + fromMonth + '-' + fromDay + ' ' + fromHour + ':00:00');
      toDateTime = new Date(toYear + '-' + toMonth + '-' + toDay + ' ' + toHour + ':59:59.999');
    } else if (isYearMonthDayHourMin(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(9, 11);
      const min = value.substring(11, 13);
      fromDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':00');
      toDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':59.999');
    } else if (isYearMonthDayHourMinPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const fromMonth = value.substring(4, 6);
      const fromDay = value.substring(6, 8);
      const fromHour = value.substring(9, 11);
      const fromMin = value.substring(11, 13);
      const toYear = value.substring(14, 18);
      const toMonth = value.substring(18, 20);
      const toDay = value.substring(20, 22);
      const toHour = value.substring(23, 25);
      const toMin = value.substring(25, 27);
      fromDateTime = new Date(fromYear + '-' + fromMonth + '-' + fromDay + ' ' + fromHour + ':' + fromMin + ':00');
      toDateTime = new Date(toYear + '-' + toMonth + '-' + toDay + ' ' + toHour + ':' + toMin + ':59.999');
    } else if (isYearMonthDayHourMinSec(value)) {
      const year = value.substring(0, 4);
      const month = value.substring(4, 6);
      const day = value.substring(6, 8);
      const hour = value.substring(9, 11);
      const min = value.substring(11, 13);
      const sec = value.substring(13, 15);
      fromDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec);
      toDateTime = new Date(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + '.999');
    } else if (isYearMonthDayHourMinSecPeriod(value)) {
      const fromYear = value.substring(0, 4);
      const fromMonth = value.substring(4, 6);
      const fromDay = value.substring(6, 8);
      const fromHour = value.substring(9, 11);
      const fromMin = value.substring(11, 13);
      const fromSec = value.substring(13, 15);
      const toYear = value.substring(16, 20);
      const toMonth = value.substring(20, 22);
      const toDay = value.substring(22, 24);
      const toHour = value.substring(25, 27);
      const toMin = value.substring(27, 29);
      const toSec = value.substring(29, 31);
      fromDateTime = new Date(fromYear + '-' + fromMonth + '-' + fromDay + ' ' + fromHour + ':' + fromMin + ':' + fromSec);
      toDateTime = new Date(toYear + '-' + toMonth + '-' + toDay + ' ' + toHour + ':' + toMin + ':' + toSec + '.999');
    }
  } catch (err) {
    console.log('Error extracting date ' + err);
  }
  return {
    fromDateTime,
    toDateTime
  };
}

export function pad(number: number) {
  return (number < 10) ? '0' + number : number;
}

/** Convert a date in this 2013-01-02 12:23:58 format */
export function formatDateTime(date: Date): string {
  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds());
}

/** Converts 'Sun May 11, 2014' to 2014-05 */
export function parseDateMonth(date: string) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  return [year, month].join('');
}

/** Converts 'Sun May 11, 2014' to 2014-05-11 */
export function parseDate(date: string) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [year, month, day].join('');
}

// parse “YYYYmmdd” to 'Fri Jul 15 2016 00:00:00 GMT+0300 (FLE Summer Time)'
export function parseFullDate(date) {
  // validate year as 4 digits, month as 01-12, and day as 01-31
  if ((date = date.match(/^(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/))) {
    // make a date
    date[0] = new Date(+date[1], +date[2] - 1, +date[3]);
    // check if month stayed the same (ie that day number is valid)
    if (date[0].getMonth() === +date[2] - 1) {
      return date[0];
    }
  }
}

// return array of [years, month]
export function parseToDate(date) {
  const dateMonth = convertToDate(date);
  let d;
  if (dateMonth) {
    d = dateMonth;
  } else if (dateMonth.length === 5) {
    const dateString = dateMonth.split('-');
    d = new Date(dateString[0], dateString[1]);
  }
  return d;
}

// Format Sun May 11, 2014 to 2014-05
export function formatDateMonth(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  return [year, month].join('-');
}

// Format Sun May 11, 2014 to 2014-05-11
export function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

export function toHHMMSS(time: string): string {
  const match = time.match(/(\d{2})(\d{2})(\d{2})/);
  return match[1] + ':' + match[2] + ':' + match[3];
}

export function convertToDate(date: string) {
  const d: Date = new Date(date);
  // missing radix parameter to parseInt
  const parseToInt = parseInt(date, 10);
  let dateStr;
  let match;
  let betterDateStr;

  switch (date.length) {
  case 4:
    if (parseToInt && !isNaN(parseToInt)) {
      return d.getFullYear();
    }
    break;
  case 6:
    if (parseToInt && !isNaN(parseToInt)) {
      dateStr = date;
      match = dateStr.match(/(\d{4})(\d{2})/);
      betterDateStr = match[1] + '-' + match[2];

      return betterDateStr;
    }
    break;
  case 8:
    if (parseToInt && !isNaN(parseToInt)) {
      dateStr = date;
      match = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
      betterDateStr = match[1] + '-' + match[2] + '-' + match[3];

      return betterDateStr;
    }
    break;
  default:
    return false;
  }
}

export function convertToDateTime(dateTime: string) {
  const dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
  const dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
  const dateTimeWin1RegExp = /^(([0-1]?[0-9])|([2][0-3]))~([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
  if (dateTime.match(dateTimeRegExp) || dateTime.match(dateTimeWinRegExp) ||
    dateTime.match(dateTimeWin1RegExp) || dateTime.search('!') ||
    dateTime.search(':') || dateTime.search('~')) {
    let time;
    let firstTime;
    let secondTime;

    if (dateTime.indexOf('!')) {
      time = dateTime.split('!');
      if (parseInt(time[0], 10) && parseInt(time[1], 10)) {
        firstTime = time[0];
        secondTime = time[1];
        if (firstTime.length === 2 && secondTime.length === 2) {
          time = firstTime + ':' + secondTime;
        } else if (firstTime.length > 2 && firstTime.length <= 8) {
          time = convertToDate(firstTime) + ' ' + toHHMMSS(secondTime);
        }
        return time;
      }
    }
    if (dateTime.indexOf(':')) {
      time = dateTime.split(':');
      if (parseInt(time[0], 10) && parseInt(time[1], 10)) {
        return time;
      }
    }
    if (dateTime.indexOf('~')) {
      time = dateTime.split('~');
      if (parseInt(time[0], 10) && parseInt(time[1], 10)) {
        firstTime = time[0];
        secondTime = time[1];
        if (firstTime.length === 2 && secondTime.length === 2) {
          time = firstTime + ':' + secondTime;
        } else if (firstTime.length > 2 && firstTime.length <= 8) {
          time = convertToDate(firstTime) + ' ' + toHHMMSS(secondTime);
        }
        return time;
      }
    }
  }
}

export function convertToDateRange(dateRange: string) {
  const dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
  if (dateRange.match(dateRangeRegExp) || dateRange.search('-')) {
    const range = dateRange.split('-');
    if (parseInt(range[0], 10) && parseInt(range[1], 10)) {
      return range;
    }
  }
}

export function splitValue(value: string, index: number) {
  const currentLat = value.substring(0, index);
  const currentLng = value.substring(index);

  return parseFloat(currentLat) + ',' + parseFloat(currentLng);
}
