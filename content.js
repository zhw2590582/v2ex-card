(function () {
  const infoCache = {};
  const domParser = new DOMParser();

  function debounce(func, wait, context) {
    let timeout;
    return function fn(...args) {
      const later = function later() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function getMemberUrl(event) {
    const $el = event.target;
    const reg = /^\/member\//;
    if ($el.tagName === "A" && reg.test($el.pathname || "")) {
      return $el.pathname;
    }
    if ($el.tagName === "IMG" && $el.className === "avatar" && $el.alt) {
      return "/member/" + $el.alt;
    }
  }

  function getInfoFromText(text) {
    const dom = domParser.parseFromString(text, "text/html");
    const $avatar = dom.querySelector(".avatar");
    const $summary = dom.querySelector("#Main .box .gray");
    const joinRank = $summary.textContent.match(/\s(\d+)\s/)[1];
    const joinTime = $summary.textContent.match(/\s(\d{4}-.*\+08:00)/)[1];
    const $activity = $summary.querySelector("a");
    const activityRank = $activity ? $activity.textContent : "";
    return {
      name: $avatar.alt,
      avatar: $avatar.src,
      joinRank: joinRank,
      joinTime: joinTime,
      activityRank: activityRank,
      topic: [],
    };
  }

  function getMemberInfo(memberUrl) {
    if (infoCache[memberUrl]) {
      return Promise.resolve(infoCache[memberUrl]);
    }
    return fetch(memberUrl)
      .then((res) => res.text())
      .then((text) => {
        infoCache[memberUrl] = getInfoFromText(text);
        return infoCache[memberUrl];
      });
  }

  function render(event, memberInfo) {
    console.log(event, memberInfo);
  }

  function onMouseMove(event) {
    const memberUrl = getMemberUrl(event);
    if (memberUrl) {
      getMemberInfo(memberUrl)
        .then((memberInfo) => {
          render(event, memberInfo);
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  }

  const onMouseMoveDebounce = debounce(onMouseMove, 300);
  document.body.addEventListener("mousemove", onMouseMoveDebounce);
})();
