var v2exCardInjected = (function () {
  'use strict';

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

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

  function addClass(target, className) {
    return target.classList.add(className);
  }
  function removeClass(target, className) {
    return target.classList.remove(className);
  }

  var Injected = /*#__PURE__*/function () {
    function Injected() {
      classCallCheck(this, Injected);

      this.$card = null;
      this.timeout = null;
      this.infoCache = {};
      this.current = null;
      this.domParser = new DOMParser();
      document.body.addEventListener('mousemove', this.onMouseMove.bind(this));
      window.addEventListener('scroll', this.onScroll.bind(this));
    }

    createClass(Injected, [{
      key: "onMouseMove",
      value: function onMouseMove(event) {
        var _this = this;

        var memberUrl = this.getMemberUrl(event);

        if (memberUrl) {
          this.getMemberInfo(memberUrl).then(function (memberInfo) {
            _this.render(event, memberUrl, memberInfo);
          })["catch"](function (err) {
            console.warn(err);
          });
        } else if (this.$card && !event.composedPath().includes(this.$card)) {
          addClass(this.$card, 'vc-hide');
        }
      }
    }, {
      key: "onScroll",
      value: function onScroll() {
        if (this.$card) {
          addClass(this.$card, 'vc-hide');
        }
      }
    }, {
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
        var online = !!dom.querySelector('#Main .box .online');
        var joinRank = $summary.textContent.match(/\s(\d+)\s/)[1];
        var joinTime = $summary.textContent.match(/\s(\d{4}-.*\+08:00)/)[1];
        var $activity = $summary.querySelector('a');
        var activityRank = $activity ? $activity.textContent : '';

        var $socials = toConsumableArray(dom.querySelectorAll('#Main .box .widgets a'));

        var socials = $socials.map(function ($item) {
          var $img = $item.querySelector('img');
          return {
            href: $item.href,
            img: $img ? $img.src : '',
            name: $item.textContent.trim()
          };
        });

        var $topic = toConsumableArray(dom.querySelectorAll('#Main .box .topic-link'));

        var topics = $topic.map(function ($item) {
          return {
            href: $item.href,
            title: $item.textContent.trim()
          };
        });
        var follow = {
          value: 'Follow',
          onclick: "location.href = '/signin'"
        };
        var block = {
          value: 'Block',
          onclick: "location.href = '/signin'"
        };
        var $function = dom.querySelectorAll('#Main [type="button"]');

        if ($function.length === 2) {
          var $follow = $function[0];
          follow.value = $follow.value === '取消特别关注' ? 'Unfollow' : 'Follow';
          follow.onclick = $follow.getAttribute('onclick');
          var $block = $function[1];
          block.value = $block.value;
          block.onclick = $block.getAttribute('onclick');
        }

        return {
          name: name,
          avatar: avatar,
          online: online,
          joinRank: joinRank,
          joinTime: joinTime,
          activityRank: activityRank,
          socials: socials,
          topics: topics,
          follow: follow,
          block: block
        };
      }
    }, {
      key: "getMemberInfo",
      value: function getMemberInfo(memberUrl) {
        var _this2 = this;

        if (this.infoCache[memberUrl]) {
          return Promise.resolve(this.infoCache[memberUrl]);
        }

        clearTimeout(this.timeout);
        return new Promise(function (resolve) {
          _this2.timeout = setTimeout(function () {
            fetch(memberUrl).then(function (res) {
              return res.text();
            }).then(function (text) {
              _this2.infoCache[memberUrl] = _this2.getInfoFromText(text);
              resolve(_this2.infoCache[memberUrl]);
            });
          }, 200);
        });
      }
    }, {
      key: "getPosFromEvent",
      value: function getPosFromEvent(event) {
        var $el = event.target;
        var clientWidth = this.$card.clientWidth;

        var _$el$getBoundingClien = $el.getBoundingClientRect(),
            x = _$el$getBoundingClien.x,
            y = _$el$getBoundingClien.y,
            width = _$el$getBoundingClien.width,
            height = _$el$getBoundingClien.height;

        var left = x + width - clientWidth / 2 - width / 2;
        var top = y + height;
        return {
          left: left,
          top: top
        };
      }
    }, {
      key: "render",
      value: function render(event, url, info) {
        if (!this.$card) {
          this.$card = document.createElement('div');
          this.$card.className = 'v2ex-card';
          document.body.appendChild(this.$card);
        }

        removeClass(this.$card, 'vc-hide');

        var _this$getPosFromEvent = this.getPosFromEvent(event),
            left = _this$getPosFromEvent.left,
            top = _this$getPosFromEvent.top;

        this.$card.style.left = "".concat(left, "px");
        this.$card.style.top = "".concat(top, "px");
        if (url === this.current) return;
        this.current = url;
        this.$card.innerHTML = "\n            <div class=\"vc-inner\">\n                <div class=\"vc-header\">\n                    <div class=\"vc-avatar\">\n                        <img src=\"".concat(info.avatar, "\" alt=\"").concat(info.name, "\" width=\"48\" height=\"48\" />\n                    </div>\n                    <div class=\"vc-info\">\n                        <div class=\"vc-row\">\n                            <span class=\"vc-name\">").concat(info.name, "</span>\n                            ").concat(info.online ? '<span class="vc-online">online</span>' : '', "\n                        </div>\n                        <div class=\"vc-row\">\n                            <span class=\"vc-join-rank\">No.").concat(info.joinRank, "</span>\n                            <span class=\"vc-activity-rank ").concat(info.activityRank ? '' : "vc-hide", "\">\n                                Active Today: ").concat(info.activityRank, "\n                            </span>\n                        </div>\n                        <div class=\"vc-row\">\n                            Join: ").concat(info.joinTime, "\n                        </div>\n                    </div>\n                </div>\n                <div class=\"vc-function\">\n                    <div class=\"vc-item\" onclick=\"").concat(info.follow.onclick, "\">\n                        ").concat(info.follow.value, "\n                    </div>\n                    <div class=\"vc-item\" onclick=\"").concat(info.block.onclick, "\">\n                        ").concat(info.block.value, "\n                    </div>\n                </div>\n                <div class=\"vc-socials ").concat(info.socials.length ? '' : "vc-hide", "\">\n                    ").concat(info.socials.map(function (item) {
          return "<a href=\"".concat(item.href, "\" title=\"").concat(item.name, "\" target=\"_blank\"><img src=\"").concat(item.img, "\" alt=\"").concat(info.name, "\"  width=\"16\" height=\"16\"/>").concat(item.name, "</a>");
        }).join(''), "\n                </div>\n                <div class=\"vc-topics ").concat(info.topics.length ? '' : "vc-hide", "\">\n                    ").concat(info.topics.slice(0, 5).map(function (item) {
          return "<a href=\"".concat(item.href, "\" title=\"").concat(item.title, "\">").concat(item.title, "</a>");
        }).join(''), "\n                </div>\n            </div>\n        ");
      }
    }]);

    return Injected;
  }();

  var index = new Injected();

  return index;

}());
//# sourceMappingURL=index.js.map
