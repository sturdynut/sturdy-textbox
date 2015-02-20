/*
 *  Sturdy Validator - v0.0.1
 *  A validator that just works.
 *  https://github.com/sturdynut/sturdy-validator
 *
 *  Made by Matti Salokangas
 *  Under MIT License
 */
(function ($, window, document, undefined) {

  "use strict";

  var Validator = function() {
    this.DATA_PREFIX = 'data-sturdy-val-';
    this.DATA_SELECTOR = '[data-sturdy-val]';
    this.DATA_TYPE = 'sturdy-val-type';
    this.DATA_ON = 'sturdy-val-on';
  };

  $.extend(Validator.prototype, {
    settings: {
      enabled: true,
      defaultEvent: 'blur',
      defaultType: 'email',
      pluginEnabled: false,
      success: function() { console.log('Valid value.'); },
      fail: function() { console.log('Invalid value.'); },
      error: function(e) { console.log(e); }
    },
    init: function (options) {
      options = $.extend({}, this.settings, options);

      var self = this;

      var elements = $(this.DATA_SELECTOR);
      var haveElements = elements && elements.length > 0;

      if (haveElements) {
        elements.toArray().forEach(function(item, index) {
          var $item = $(item);
          self._validateElement($item, self._getOptionsForElement($item));
        });

        if (options.pluginEnabled) {
          this._initPlugIn(options);
        }
      }
    },
    _getOptionsForElement: function($element) {
      var type = $element.data(this.DATA_TYPE);
      var on = $element.data(this.DATA_ON);
      if (on) {
        on = on.replace(',', ' ');
      }

      var options = {
        type: type,
        on: on
      };

      return options;
    },
    _validators: function() {
      return Sturdy.Validator.Validators || [];
    },
    _validateElement: function($element, options) {
      var self = this;
      $element.on(options.on || this.settings.defaultEvent, function() {
        self._validate($(this), options);
      });
    },
    _validateSelector: function(selector, options) {
      _validateElement($(selector), options);
    },
    _validate: function ($el, options) {
      options = $.extend({}, options, this.settings);

      var validator = Sturdy.Validator._lookup(options.type || this.settings.defaultType);
      try {
        (validator.validate($el.val()) ?
          options.success :
          options.fail)();
      } catch(e) {
        options.error(e);
      }
    },
    _lookup: function (type) {
      var index = this._validators().map(function(validator) {
        return validator.type;
      }).indexOf(type);
      return this._validators()[index];
    },
    _initPlugIn: function (options) {
      var pluginName = "validate";

      function Plugin (selector) {
        this.selector = selector;
        this._name = pluginName;
        this.init();
      }

      Plugin.prototype.init = function (options) {
        options = options || {};
        var $el = $(selector);

        if ($el.length > 0) {
          Sturdy.Validator._validateSelector(selector, options);
        }
        else{
          throw new Error('Element not found: ' + selector);
        }

        return $el;
      };

      $.fn[pluginName] = function (options) {
        return this.each(function() {
          if (!$.data(this, "plugin_" + pluginName)) {
            $.data(this, "plugin_" + pluginName, new Plugin(this, options));
          }
        });
      };
    }
  });

  var BaseValidator = function (type, validate) {
    this.type = type;
    this.validate = validate;
  };
  BaseValidator.prototype.type = 'base';
  BaseValidator.prototype.validate = function () {
    throw new Error('Validate is not implemented.');
  };

  window.Sturdy = window.Sturdy || {};
  window.Sturdy.Validator = new Validator();
  window.Sturdy.Validator.Validators = [];
  window.Sturdy.Validator.ValidatorBase = BaseValidator;

})(jQuery, window, document);
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('address', function(value) {
  return value.length > 5;
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('credit-card', function(value) {
  if (/[^0-9-\s]+/.test(value)) return false;

  // The Luhn Algorithm. It's so pretty.
  // creds: https://gist.github.com/DiegoSalazar/4075533
  var nCheck = 0, nDigit = 0, bEven = false;
  value = value.replace(/\D/g, '');

  for (var n = value.length - 1; n >= 0; n--) {
    var cDigit = value.charAt(n),
        nDigit = parseInt(cDigit, 10);

    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return (nCheck % 10) == 0;
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('date', function(value) {
  return value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('email', function(value) {
  return value.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('email', function(value) {
  return value.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('social-security', function(value) {
  return value.match(/^\d{3}-\d{2}-\d{4}$/);
}));
;Sturdy.Validator.Validators.push(new Sturdy.Validator.ValidatorBase('time', function(value) {
  return value.match(/^\d{1,2}:\d{2}([ap]m)?$/);
}));
