var bilibiliLiveRecorderInjected = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  function debounce(func, wait, context) {
    var timeout;
    return function fn() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var later = function later() {
        timeout = null;
        func.apply(context, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  var Injected = /*#__PURE__*/function () {
    function Injected() {
      classCallCheck(this, Injected);

      this.infoCache = {};
      this.domParser = new DOMParser();
      var onMouseMoveDebounce = debounce(this.onMouseMove.bind(this), 300);
      document.body.addEventListener('mousemove', onMouseMoveDebounce);
    }

    createClass(Injected, [{
      key: "getMemberUrl",
      value: function getMemberUrl(event) {
        var $el = event.target;
        var reg = /^\/member\//;

        if ($el.tagName === 'A' && reg.test($el.pathname || '')) {
          return $el.pathname;
        }

        if ($el.tagName === 'IMG' && $el.className === 'avatar' && $el.alt) {
          return "/member/".concat($el.alt);
        }

        return null;
      }
    }, {
      key: "getInfoFromText",
      value: function getInfoFromText(text) {
        var dom = this.domParser.parseFromString(text, 'text/html');
        var $avatar = dom.querySelector('.avatar');
        var $summary = dom.querySelector('#Main .box .gray');
        var name = $avatar.alt;
        var avatar = $avatar.src;
        var joinRank = $summary.textContent.match(/\s(\d+)\s/)[1];
        var joinTime = $summary.textContent.match(/\s(\d{4}-.*\+08:00)/)[1];
        var $activity = $summary.querySelector('a');
        var activityRank = $activity ? $activity.textContent : '';
        return {
          name: name,
          avatar: avatar,
          joinRank: joinRank,
          joinTime: joinTime,
          activityRank: activityRank,
          socials: [],
          topics: []
        };
      }
    }, {
      key: "getMemberInfo",
      value: function getMemberInfo(memberUrl) {
        var _this = this;

        if (this.infoCache[memberUrl]) {
          return Promise.resolve(this.infoCache[memberUrl]);
        }

        return fetch(memberUrl).then(function (res) {
          return res.text();
        }).then(function (text) {
          _this.infoCache[memberUrl] = _this.getInfoFromText(text);
          return _this.infoCache[memberUrl];
        });
      }
    }, {
      key: "render",
      value: function render(event, memberInfo) {
        console.log(event, memberInfo);
      }
    }, {
      key: "onMouseMove",
      value: function onMouseMove(event) {
        var _this2 = this;

        var memberUrl = this.getMemberUrl(event);

        if (memberUrl) {
          this.getMemberInfo(memberUrl).then(function (memberInfo) {
            _this2.render(event, memberInfo);
          })["catch"](function (err) {
            console.warn(err);
          });
        }
      }
    }]);

    return Injected;
  }();

  var index = new Injected();

  return index;

}());
//# sourceMappingURL=index.js.map
