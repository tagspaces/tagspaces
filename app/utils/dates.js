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

// Format Sun May 11, 2014 to 2014-05
export function parseDateMonth(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  return [year, month].join('');
}

// Format Sun May 11, 2014 to 2014-05-11
export function parseDate(date) {
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

export function toHHMMSS(time) {
  const match = time.match(/(\d{2})(\d{2})(\d{2})/);
  return match[1] + ':' + match[2] + ':' + match[3];
}

export function convertToDate(date) {
  const d = new Date(date);
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

export function convertToDateTime(dateTime) {
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

export function convertToDateRange(dateRange) {
  const dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
  if (dateRange.match(dateRangeRegExp) || dateRange.search('-')) {
    const range = dateRange.split('-');
    if (parseInt(range[0], 10) && parseInt(range[1], 10)) {
      return range;
    }
  }
}

export function splitValue(value, index) {
  const currentLat = value.substring(0, index);
  const currentLng = value.substring(index);

  return parseFloat(currentLat) + ',' + parseFloat(currentLng);
}
