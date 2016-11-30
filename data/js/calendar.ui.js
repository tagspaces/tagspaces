/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode, isFirefox */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading calendar.ui.js ...');

  var TSCORE = require('tscore');

  require('datetimepicker');
  require('moment');


  function initCalendarUI() {
    $('#dateCalendarInput').click(function() {
      $('#dateTimeCalendar').hide();
      $('#dateTimeRange').hide();
      $('#dateCalendar').show();
    });

    $('#dateTimeInput').click(function() {
      $('#dateTimeCalendar').show();
      $('#dateTimeRange').hide();
      $('#dateCalendar').hide();
    });
    $('#dateTimeRangeInput').click(function() {
      $('#dateTimeCalendar').hide();
      $('#dateTimeRange').show();
      $('#dateCalendar').hide();
    });

    $('.nav-tabs a[href="#dateCalendarTab"]').on('click', function() {
      $('#dateCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });
      var defaultDateCalendar = "2016-01-01";
      $('#dateCalendar').on('dp.change', function(e) {
        var d;
        var currentDate;
        d = e.date._d;
        currentDate = TSCORE.Utils.parseDate(d);
        $('#newTagName').val(currentDate);
      });
      $('#dateCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').toggle().show();
    });

    $('.nav-tabs a[href="#dateTimeCalendarTab"]').on('click', function() {
      $('#dateTimeCalendar').datetimepicker({
        viewMode: 'days',
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });
      var defaultDateCalendar = "1990-01-01";
      $('#dateTimeCalendar').on('dp.change', function(e) {
        var currentDate;
        var d = e.date._d;
        var getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        //var getSeconds = d.getSeconds();

        var time = getHours + '' + getMinutes + '' + '00';
        currentDate = TSCORE.Utils.parseDate(d);
        var dateDivider;
        dateDivider = '~';
        currentDate = currentDate + dateDivider + time;

        $('#newTagName').val(currentDate);
      });
      $('#dateTimeCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').toggle().show();
    });

    $('.nav-tabs a[href="#dateRangeTab"]').on('click', function() {
      var defaultDateCalendarFrom = "2016-01-01";
      var defaultDateCalendarTo = "2016-01-01";

      $('#dateTimeRangeCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });

      $('#dateTimeRangeCalendar').on('dp.change', function(e) {
        var d = e.date._d;
        var currentMinDate = TSCORE.Utils.parseDate(d);
        var oldValue = $('#newTagName').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[1];
        $('#newTagName').val(currentMinDate + "-" + oldValue);
      });

      $('#dateTimeRangeCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarFrom).viewMode('days').toggle().show();

      $('#dateTimeRangeMaxCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: true
      });

      $('#dateTimeRangeMaxCalendar').on('dp.change', function(e) {
        var d = e.date._d;
        var currentMaxDate = TSCORE.Utils.parseDate(d);

        var oldValue = $('#newTagName').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[0];
        $('#newTagName').val(oldValue + "-" + currentMaxDate);
      });

      $('#dateTimeRangeMaxCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarTo).viewMode('days').toggle().show();
    });
  }

  function dateCalendarTag(currentDateTime) {
    var defaultDateCalendar = TSCORE.Utils.parseToDate(currentDateTime);
    var viewMode = '', format = '';

    if (defaultDateCalendar.toString().length === 7 || defaultDateCalendar.length === 7) {
      viewMode = 'months';
      format = 'YYYY/MM';
    } else if (defaultDateCalendar.toString().length === 4) {
      viewMode = 'years';
      format = 'YYYY';
    } else if (defaultDateCalendar.toString().length === 10) {
      viewMode = 'days';
      format = 'YYYY/MM/DD';
    } else {
      viewMode = 'days';
      format = 'YYYY/MM/DD';
    }

    $('#dateCalendar').datetimepicker({
      //extraFormats: ['YYYY-MM-DD', 'YYYY-MM'],
      format: 'YYYY/MM/DD',
      inline: true,
      sideBySide: false,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: true
    });

    $('#dateCalendar').on('dp.change', function(e) {
      var d;
      var currentDate;
      if (viewMode === 'years') {
        d = e.date._d;
        currentDate = d.getFullYear();
      } else if (viewMode === 'months') {
        d = e.date._d;
        currentDate = TSCORE.Utils.parseDateMonth(d);
      } else if (viewMode === 'default' || viewMode === 'days') {
        d = e.date._d;
        currentDate = TSCORE.Utils.parseDate(d);
      } else {
        d = e.date._d;
        currentDate = TSCORE.Utils.parseDate(d);
      }
      $('#newTagName').val(currentDate);
    });
    $('#dateCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(defaultDateCalendar).viewMode(viewMode).toggle().show();
  }

  function showDateTimeCalendar(currentDateTime) {
    $('#dateTimeCalendar').datetimepicker({
      inline: true,
      sideBySide: true,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: true,
      extraFormats: ['YYYY-MM-DD HH:mm:ss', 'HH:mm:ss', 'HH:mm']
    });

    var defaultDate = TSCORE.Utils.convertToDateTime(currentDateTime);
    $('#dateTimeCalendar').on('dp.change', function(e) {
      var currentDate;
      var d = e.date._d;
      var getHours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      var getMinutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      //var getSeconds = d.getSeconds();

      var time = getHours + '' + getMinutes + '' + '00';
      currentDate = TSCORE.Utils.parseDate(d);
      var dateDivider;
      var dateTag = TSCORE.selectedTag;
      if (dateTag.length !== 5) {
        if (dateTag.indexOf('~') !== -1) {
          dateDivider = '~';
          currentDate = currentDate + dateDivider + time;
        }
        if (dateTag.indexOf(':') !== -1 && dateTag.length !== 5) {
          dateDivider = ':';
          currentDate = currentDate + dateDivider + time;
        }
        if (dateTag.indexOf('!') !== -1 && dateTag.length !== 5) {
          dateDivider = '!';
          currentDate = currentDate + dateDivider + time;
        }
      } else {
        if (dateTag.indexOf('~')) {
          dateDivider = '~';
          currentDate = getHours + dateDivider + getMinutes;
        }
        if (dateTag.indexOf(':')) {
          dateDivider = ':';
          currentDate = getHours + dateDivider + getMinutes;
        }
        if (dateTag.indexOf('!')) {
          dateDivider = '!';
          currentDate = getHours + dateDivider + getMinutes;
        }
      }
      $('#newTagName').val(currentDate);
    });

    $('#dateTimeCalendar').data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss').useCurrent(true).defaultDate(defaultDate).toggle().show();
  }

  function dateRangeCalendar(currentDateTime) {
    var range = TSCORE.Utils.convertToDateRange(currentDateTime);
    console.log(range);
    var viewMode = '', format = '';
    if ((range[0].toString().length === 6 || range[0].length === 6) &&
      (range[1].toString().length === 6 || range[1].length === 6)) {
      viewMode = 'months';
      format = 'YYYY-MM';
    } else if (range[0].toString().length === 4 &&
      range[1].toString().length === 4) {
      viewMode = 'years';
      format = 'YYYY';
    } else {
      viewMode = 'days';
      format = 'YYYY-MM-DD';
    }

    $('#dateTimeRangeCalendar').datetimepicker({
      extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
      inline: true,
      sideBySide: false,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: true
    });

    $('#dateTimeRangeCalendar').on('dp.change', function(e) {
      var currentMinDate;
      var d;
      if (viewMode === 'years') {
        d = e.date._d;
        currentMinDate = d.getFullYear();
      } else if (viewMode === 'months') {
        d = e.date._d;
        currentMinDate = TSCORE.Utils.parseDateMonth(d);
      } else if (viewMode === 'days') {
        d = e.date._d;
        currentMinDate = TSCORE.Utils.parseDate(d);
      }
      var oldValue = $('#newTagName').val();
      oldValue = oldValue.split('-');
      oldValue = oldValue[1];
      $('#newTagName').val(currentMinDate + "-" + oldValue);
    });

    $('#dateTimeRangeCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(TSCORE.Utils.convertToDate(range[0])).viewMode(viewMode).toggle().show();

    $('#dateTimeRangeMaxCalendar').datetimepicker({
      extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
      inline: true,
      sideBySide: false,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: true
    });

    $('#dateTimeRangeMaxCalendar').on('dp.change', function(e) {
      var d;
      var currentMaxDate;
      if (viewMode === 'years') {
        d = e.date._d;
        currentMaxDate = d.getFullYear();
      } else if (viewMode === 'months') {
        d = e.date._d;
        currentMaxDate = TSCORE.Utils.parseDateMonth(d);
      } else if (viewMode === 'days') {
        d = e.date._d;
        currentMaxDate = TSCORE.Utils.parseDate(d);
      }
      var oldValue = $('#newTagName').val();
      oldValue = oldValue.split('-');
      oldValue = oldValue[0];
      $('#newTagName').val(oldValue + "-" + currentMaxDate);
    });

    $('#dateTimeRangeMaxCalendar').data('DateTimePicker').format(format).useCurrent(true).defaultDate(TSCORE.Utils.convertToDate(range[1])).viewMode(viewMode).toggle().show();
  }

  function tagRecognition(dataTag) {
    var geoLocationRegExp = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/g;

    var dateTimeRegExp = /^\d\d\d\d-(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g;
    var dateTimeWinRegExp = /^(([0-1]?[0-9])|([2][0-3]))!([0-5]?[0-9])(!([0-5]?[0-9]))?$/g;
    var dateRangeRegExp = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[-]([0]?[1-9]|[1][0-2])$/g;
    var geoTag = 'geo-tag';
    var currentCoordinate;
    var currentDateTime = dataTag;

    var year = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
      currentDateTime.length === 4;
    var month = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
      currentDateTime.length === 6;
    var date = parseInt(currentDateTime) && !isNaN(currentDateTime) &&
      currentDateTime.length === 8;

    var convertToDateTime = TSCORE.Utils.convertToDateTime(currentDateTime);

    var yearRange, monthRange, dateRange;

    if (dataTag.lastIndexOf('+') !== -1) {
      currentCoordinate = TSCORE.Utils.splitValue(dataTag, dataTag.lastIndexOf('+'));
    } else if (dataTag.lastIndexOf('-') !== -1) {
      currentCoordinate = TSCORE.Utils.splitValue(dataTag, dataTag.lastIndexOf('-'));

      var character = currentDateTime.split("-");
      if (!currentCoordinate.search(".") && character) {
        var firstInt = parseInt(character[0]);
        var secondInt = parseInt(character[1]);
        yearRange = monthRange = dateRange =
          typeof firstInt === 'number' && !isNaN(firstInt) &&
          typeof secondInt === 'number' && !isNaN(secondInt);
      }
    }

    var dateRegExp = yearRange || monthRange || dateRange ||
      currentDateTime.match(dateTimeRegExp) ||
      currentDateTime.match(dateTimeWinRegExp) ||
      year || month || date || convertToDateTime;

    if (geoLocationRegExp.exec(currentCoordinate) || geoTag === dataTag) {
      if (TSCORE.PRO) {
        $('.nav-tabs a[href="#geoLocation"]').tab('show');
      } else {
        $('.nav-tabs a[href="#plainEditorTab"]').tab('show');
      }
    } else if (dateRegExp) {
      var dateTab = year || month || date;
      var dateTimeTab = currentDateTime.match(dateTimeRegExp) ||
        currentDateTime.match(dateTimeWinRegExp) || convertToDateTime;
      var dateRangeTab = currentDateTime.match(dateRangeRegExp) ||
        yearRange || monthRange || dateRange;

      if (dateTab) {
        $('.nav-tabs a[href="#dateCalendarTab"]').tab('show');
        //$('#dateCalendarInput').prop('checked', true);
        //if (document.getElementById('dateCalendarInput').checked) {
        TSCORE.Calendar.dateCalendarTag(currentDateTime);
      } else if (dateTimeTab) {
        $('.nav-tabs a[href="#dateTimeCalendarTab"]').tab('show');
        //$('#dateTimeInput').prop('checked', true);
        //if (document.getElementById('dateTimeInput').checked) {
        TSCORE.Calendar.showDateTimeCalendar(currentDateTime);
      } else if (dateRangeTab) {
        $('.nav-tabs a[href="#dateRangeTab"]').tab('show');
        //$('#dateTimeRangeInput').prop('checked', true);
        //if (document.getElementById('dateTimeRangeInput').checked) {
        TSCORE.Calendar.dateRangeCalendar(currentDateTime);
      }
    } else if (!(dateRegExp && geoLocationRegExp.exec(currentCoordinate))) {
      $('.nav-tabs a[href="#plainEditorTab"]').tab('show');
    } else {
      throw new TypeError("Invalid data.");
    }
  }

  // Public API definition
  exports.initCalendarUI = initCalendarUI;
  exports.dateCalendarTag = dateCalendarTag;
  exports.showDateTimeCalendar = showDateTimeCalendar;
  exports.dateRangeCalendar = dateRangeCalendar;
  exports.tagRecognition = tagRecognition;
});