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


  function initCalendarUI(){
    $('.nav-tabs a[href="#dateCalendarTab"]').on('click', function() {
      $('#dateCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: false
      });
      $('#dateInputCalendar').show();
      var defaultDateCalendar = "1990-01-01";
      $('#dateCalendar').on('dp.change', function(e) {
        var d;
        var currentDate;
        d = e.date._d;
        currentDate = TSCORE.Utils.parseDate(d);
        $('#dateInputCalendar').val(currentDate);
      });
      $('#dateCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').show();
    });

    $('.nav-tabs a[href="#dateTimeCalendarTab"]').on('click', function() {
      $('#dateTimeCalendar').datetimepicker({
        viewMode: 'days',
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: false
      });
      $('#dateInputCalendar').show();
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

        $('#dateInputCalendar').val(currentDate);
      });
      $('#dateTimeCalendar').data('DateTimePicker').format('YYYY/MM/DD').defaultDate(defaultDateCalendar).viewMode('days').show();
    });

    $('.nav-tabs a[href="#dateRangeTab"]').on('click', function() {
      $('#dateInputCalendar').show();
      var defaultDateCalendarFrom = "1990-01-01";
      var defaultDateCalendarTo = "1990-01-01";

      $('#dateTimeRangeCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: false
      });

      $('#dateTimeRangeCalendar').on('dp.change', function(e) {
        var  d = e.date._d;
        var  currentMinDate = TSCORE.Utils.parseDate(d);

        var oldValue = $('#dateInputCalendar').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[1];
        $('#dateInputCalendar').val(currentMinDate + "-" + oldValue);
      });

      $('#dateTimeRangeCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarFrom).viewMode('days').show();

      $('#dateTimeRangeMaxCalendar').datetimepicker({
        viewMode: 'days',
        format: 'YYYY/MM/DD',
        //extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
        inline: true,
        sideBySide: false,
        calendarWeeks: true,
        showTodayButton: true,
        allowInputToggle: true,
        useCurrent: false
      });

      $('#dateTimeRangeMaxCalendar').on('dp.change', function(e) {
        var d = e.date._d;
        var currentMaxDate = TSCORE.Utils.parseDate(d);

        var oldValue = $('#dateInputCalendar').val();
        oldValue = oldValue.split('-');
        oldValue = oldValue[0];
        $('#dateInputCalendar').val(oldValue + "-" + currentMaxDate);
      });

      $('#dateTimeRangeMaxCalendar').data('DateTimePicker').defaultDate(defaultDateCalendarTo).viewMode('days').show();
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
      useCurrent: false
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
      $('#dateInputCalendar').val(currentDate);
    });
    $('#dateCalendar').data('DateTimePicker').format(format).defaultDate(defaultDateCalendar).viewMode(viewMode).show();
  }

  function showDateTimeCalendar(currentDateTime) {
    $('#dateTimeCalendar').datetimepicker({
      inline: true,
      sideBySide: true,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: false,
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
      $('#dateInputCalendar').val(currentDate);
    });

    $('#dateTimeCalendar').data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss').defaultDate(defaultDate).show();
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
      useCurrent: false
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
      var oldValue = $('#dateInputCalendar').val();
      oldValue = oldValue.split('-');
      oldValue = oldValue[1];
      $('#dateInputCalendar').val(currentMinDate + "-" + oldValue);
    });

    $('#dateTimeRangeCalendar').data('DateTimePicker').format(format).defaultDate(TSCORE.Utils.convertToDate(range[0])).viewMode(viewMode).show();

    $('#dateTimeRangeMaxCalendar').datetimepicker({
      extraFormats: ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DDTHH:MM:SS', 'YYYY-MM-DDTHH:MM', 'YYYY-MM-DD HH:mm:ss'],
      inline: true,
      sideBySide: false,
      calendarWeeks: true,
      showTodayButton: true,
      allowInputToggle: true,
      useCurrent: false
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
      var oldValue = $('#dateInputCalendar').val();
      oldValue = oldValue.split('-');
      oldValue = oldValue[0];
      $('#dateInputCalendar').val(oldValue + "-" + currentMaxDate);
    });

    $('#dateTimeRangeMaxCalendar').data('DateTimePicker').format(format).defaultDate(TSCORE.Utils.convertToDate(range[1])).viewMode(viewMode).show();
  }

  // Public API definition
  exports.initCalendarUI = initCalendarUI;
  exports.dateCalendarTag = dateCalendarTag;
  exports.showDateTimeCalendar = showDateTimeCalendar;
  exports.dateRangeCalendar = dateRangeCalendar;
});