/*!
 * v2ex-card v1.0.0
 * Github: https://github.com/zhw2590582/v2ex-card
 * (c) 2018-2020 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";const e=t=>new Promise(r=>t.createReader().readEntries(t=>Promise.all(t.filter(e=>"."!==e.name[0]).map(t=>t.isDirectory?e(t):new Promise(e=>t.file(e)))).then(e=>[].concat(...e)).then(r))),t=(r,n)=>{(t=>e(t).then(e=>e.map(e=>e.name+e.lastModifiedDate).join()))(r).then(e=>{n&&n!==e?chrome.tabs.query({active:!0,currentWindow:!0},e=>{e[0]&&chrome.tabs.reload(e[0].id),chrome.runtime.reload()}):setTimeout(()=>t(r,e),1e3)})};chrome.management.getSelf(e=>{"development"===e.installType&&chrome.runtime.getPackageDirectoryEntry(e=>t(e))})}();
