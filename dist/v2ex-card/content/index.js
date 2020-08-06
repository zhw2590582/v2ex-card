/*!
 * v2ex-card v1.0.0
 * Github: https://github.com/zhw2590582/v2ex-card
 * (c) 2018-2020 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";var e=document.createElement("script");e.src=chrome.extension.getURL("injected/index.js"),e.dataset.from="v2ex-card",e.onload=function(){return e.remove()},document.documentElement.appendChild(e);var t=document.createElement("link");t.rel="stylesheet",t.type="text/css",t.dataset.from="v2ex-card",t.href=chrome.extension.getURL("injected/index.css"),function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return new Promise((function(t){return setTimeout(t,e)}))}().then((function(){return document.head.appendChild(t)}))}();
