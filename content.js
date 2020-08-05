(function () {
  const cache = {};
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

  function getMemberInfo(memberUrl) {
    if (cache[memberUrl]) {
      return Promise.resolve(cache[memberUrl]);
    }
    return fetch(memberUrl)
      .then((res) => res.text())
      .then((text) => {
        const dom = domParser.parseFromString(text, "text/html");
        cache[memberUrl] = {
          url: memberUrl,
          name: dom.querySelector(".avatar").alt,
          avatar: dom.querySelector(".avatar").src,
        };
        return cache[memberUrl];
      });
  }

  function onMouseMove(event) {
    const memberUrl = getMemberUrl(event);
    if (memberUrl) {
      getMemberInfo(memberUrl)
        .then((memberInfo) => {
          console.log(memberInfo);
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  }

  const onMouseMoveDebounce = debounce(onMouseMove, 300);
  document.body.addEventListener("mousemove", onMouseMoveDebounce);
})();
