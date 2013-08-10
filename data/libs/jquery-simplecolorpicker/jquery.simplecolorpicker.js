/*
 * Very simple jQuery Color Picker
 * https://github.com/tkrotoff/jquery-simplecolorpicker
 *
 * Copyright (C) 2012-2013 Tanguy Krotoff <tkrotoff@gmail.com>
 *
 * Licensed under the MIT license
 */

(function($) {
  'use strict';

  /**
   * Constructor.
   */
  var SimpleColorPicker = function(select, options) {
    this.init('simplecolorpicker', select, options);
  };

  /**
   * SimpleColorPicker class.
   */
  SimpleColorPicker.prototype = {
    constructor: SimpleColorPicker,

    init: function(type, select, options) {
      var self = this;

      self.type = type;

      self.$select = $(select);
      var selectValue = self.$select.val();
      self.options = $.extend({}, $.fn.simplecolorpicker.defaults, options);

      self.$select.hide();

      // Trick: fix span alignment
      // When a span does not contain any text, its alignment is not correct
      var fakeText = '&nbsp;&nbsp;&nbsp;&nbsp;';

      self.$colorList = null;

      if (self.options.picker) {
        var selectText = self.$select.find('option:selected').text();
        self.$icon = $('<span class="simplecolorpicker icon"'
                     + ' title="' + selectText + '"'
                     + ' style="background-color: ' + selectValue + ';"'
                     + ' role="button" tabindex="0">'
                     + fakeText
                     + '</span>').insertAfter(self.$select);
        self.$icon.on('click.' + self.type, $.proxy(self.showPicker, self));

        self.$picker = $('<span class="simplecolorpicker picker"></span>').appendTo(document.body);
        self.$colorList = self.$picker;

        // Hide picker when clicking outside
        $(document).on('mousedown.' + self.type, $.proxy(self.hidePicker, self));
        self.$picker.on('mousedown.' + self.type, $.proxy(self.mousedown, self));
      } else {
        self.$inline = $('<span class="simplecolorpicker inline"></span>').insertAfter(self.$select);
        self.$colorList = self.$inline;
      }

      // Build the list of colors
      // <span class="selected" title="Green" style="background-color: #7bd148;" role="button"></span>
      var colors = '';
      $('option', self.$select).each(function() {
        var option = $(this);
        var color = option.val();
        var title = option.text();
        var selected = '';
        if (option.prop('selected') === true || selectValue === color) {
          selected = 'class="selected"';
        }
        colors += '<span ' + selected
                + ' title="' + title + '"'
                + ' style="background-color: ' + color + ';"'
                + ' data-color="' + color + '"'
                + ' role="button" tabindex="0">'
                + fakeText
                + '</span>';
      });

      self.$colorList.html(colors);
      self.$colorList.on('click.' + self.type, $.proxy(self.click, self));
    },

    /**
     * Changes the selected color.
     *
     * @param color the hexadecimal color to select, ex: '#fbd75b'
     */
    selectColor: function(color) {
      var self = this;

      var colorSpan = self.$colorList.find('span').filter(function() {
        return $(this).data('color').toLowerCase() === color.toLowerCase();
      });

      if (colorSpan.length > 0) {
        self.selectColorSpan(colorSpan);
      } else {
        console.error("The given color '" + color + "' could not be found");
      }
    },

    showPicker: function() {
      var bootstrapArrowWidth = 16; // Empirical value
      var pos = this.$icon.offset();
      this.$picker.css({
        left: pos.left + this.$icon.width() / 2 - bootstrapArrowWidth, // Middle of the icon
        top: pos.top + this.$icon.outerHeight()
      });

      this.$picker.show(this.options.delay);
    },

    hidePicker: function() {
      this.$picker.hide(this.options.delay);
    },

    /**
     * Selects the given span inside $colorList.
     *
     * The given span becomes the selected one.
     * It also changes the HTML select value, this will emit the 'change' event.
     */
    selectColorSpan: function(colorSpan) {
      var color = colorSpan.data('color');
      var title = colorSpan.prop('title');

      // Mark this span as the selected one
      colorSpan.siblings().removeClass('selected');
      colorSpan.addClass('selected');

      if (this.options.picker) {
        this.$icon.css('background-color', color);
        this.$icon.prop('title', title);
        this.hidePicker();
      }

      // Change HTML select value
      this.$select.val(color);
    },

    /**
     * The user clicked on a span inside $colorList.
     */
    click: function(e) {
      var target = $(e.target);
      if (target.length === 1) {
        if (target[0].nodeName.toLowerCase() === 'span') {
          // When you click on a color, make it the new selected one
          this.selectColorSpan(target);
          this.$select.trigger('change');
        }
      }
    },

    /**
     * Prevents the mousedown event from "eating" the click event.
     */
    mousedown: function(e) {
      e.stopPropagation();
      e.preventDefault();
    },

    destroy: function() {
      if (this.options.picker) {
        this.$icon.off('.' + this.type);
        this.$icon.remove();
        $(document).off('.' + this.type);
      }

      this.$colorList.off('.' + this.type);
      this.$colorList.remove();

      this.$select.removeData(this.type);
      this.$select.show();
    }
  };

  /**
   * Plugin definition.
   * How to use: $('#id').simplecolorpicker()
   */
  $.fn.simplecolorpicker = function(option) {
    var args = $.makeArray(arguments);
    args.shift();

    // For HTML element passed to the plugin
    return this.each(function() {
      var $this = $(this),
        data = $this.data('simplecolorpicker'),
        options = typeof option === 'object' && option;
      if (data === undefined) {
        $this.data('simplecolorpicker', (data = new SimpleColorPicker(this, options)));
      }
      if (typeof option === 'string') {
        data[option].apply(data, args);
      }
    });
  };

  /**
   * Default options.
   */
  $.fn.simplecolorpicker.defaults = {
    // Animation delay
    delay: 0,

    // Show the picker or make it inline
    picker: false
  };

})(jQuery);
