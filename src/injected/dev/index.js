import './index.scss';
import { addClass, removeClass } from '../../share';

class Injected {
    constructor() {
        this.$card = null;
        this.timeout = null;
        this.infoCache = {};
        this.current = null;
        this.domParser = new DOMParser();
        document.body.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('scroll', this.onScroll.bind(this));
    }

    onMouseMove(event) {
        const memberUrl = this.getMemberUrl(event);
        if (memberUrl) {
            this.getMemberInfo(memberUrl)
                .then((memberInfo) => {
                    this.render(event, memberUrl, memberInfo);
                })
                .catch((err) => {
                    console.warn(err);
                });
        } else if (this.$card && !event.composedPath().includes(this.$card)) {
            addClass(this.$card, 'vc-hide');
        }
    }

    onScroll() {
        if (this.$card) {
            addClass(this.$card, 'vc-hide');
        }
    }

    getMemberUrl(event) {
        const $el = event.target;
        const reg = /^\/member\//;
        if ($el.tagName === 'A' && reg.test($el.pathname || '')) {
            return $el.pathname;
        }
        if ($el.tagName === 'IMG' && $el.className === 'avatar' && $el.alt) {
            return `/member/${$el.alt}`;
        }
        return null;
    }

    getInfoFromText(text) {
        const dom = this.domParser.parseFromString(text, 'text/html');
        const $avatar = dom.querySelector('.avatar');
        const $summary = dom.querySelector('#Main .box .gray');
        const name = $avatar.alt;
        const avatar = $avatar.src;
        const online = !!dom.querySelector('#Main .box .online');
        const joinRank = $summary.textContent.match(/\s(\d+)\s/)[1];
        const joinTime = $summary.textContent.match(/\s(\d{4}-.*\+08:00)/)[1];
        const $activity = $summary.querySelector('a');
        const activityRank = $activity ? $activity.textContent : '';
        const $socials = [...dom.querySelectorAll('#Main .box .widgets a')];
        const socials = $socials.map(($item) => {
            const $img = $item.querySelector('img');
            return {
                href: $item.href,
                img: $img ? $img.src : '',
                name: $item.textContent.trim(),
            };
        });
        const $topic = [...dom.querySelectorAll('#Main .box .topic-link')];
        const topics = $topic.map(($item) => {
            return {
                href: $item.href,
                title: $item.textContent.trim(),
            };
        });

        const follow = {
            value: 'Follow',
            onclick: `location.href = '/signin'`,
        };
        const block = {
            value: 'Block',
            onclick: `location.href = '/signin'`,
        };
        const $function = dom.querySelectorAll('#Main [type="button"]');
        if ($function.length === 2) {
            const $follow = $function[0];
            follow.value = $follow.value === '取消特别关注' ? 'Unfollow' : 'Follow';
            follow.onclick = $follow.getAttribute('onclick');
            const $block = $function[1];
            block.value = $block.value;
            block.onclick = $block.getAttribute('onclick');
        }

        return {
            name,
            avatar,
            online,
            joinRank,
            joinTime,
            activityRank,
            socials,
            topics,
            follow,
            block,
        };
    }

    getMemberInfo(memberUrl) {
        if (this.infoCache[memberUrl]) {
            return Promise.resolve(this.infoCache[memberUrl]);
        }

        clearTimeout(this.timeout);
        return new Promise((resolve) => {
            this.timeout = setTimeout(() => {
                fetch(memberUrl)
                    .then((res) => res.text())
                    .then((text) => {
                        this.infoCache[memberUrl] = this.getInfoFromText(text);
                        resolve(this.infoCache[memberUrl]);
                    });
            }, 200);
        });
    }

    getPosFromEvent(event) {
        const $el = event.target;
        const { clientWidth } = this.$card;
        const { x, y, width, height } = $el.getBoundingClientRect();
        const left = x + width - clientWidth / 2 - width / 2;
        const top = y + height;
        return {
            left,
            top,
        };
    }

    render(event, url, info) {
        if (!this.$card) {
            this.$card = document.createElement('div');
            this.$card.className = 'v2ex-card';
            document.body.appendChild(this.$card);
        }

        removeClass(this.$card, 'vc-hide');

        const { left, top } = this.getPosFromEvent(event);
        this.$card.style.left = `${left}px`;
        this.$card.style.top = `${top}px`;

        if (url === this.current) return;
        this.current = url;

        this.$card.innerHTML = `
            <div class="vc-inner">
                <div class="vc-header">
                    <div class="vc-avatar">
                        <img src="${info.avatar}" alt="${info.name}" width="48" height="48" />
                    </div>
                    <div class="vc-info">
                        <div class="vc-row">
                            <span class="vc-name">${info.name}</span>
                            ${info.online ? '<span class="vc-online">online</span>' : ''}
                        </div>
                        <div class="vc-row">
                            <span class="vc-join-rank">No.${info.joinRank}</span>
                            <span class="vc-activity-rank ${info.activityRank ? '' : `vc-hide`}">
                                Active Today: ${info.activityRank}
                            </span>
                        </div>
                        <div class="vc-row">
                            Join: ${info.joinTime}
                        </div>
                    </div>
                </div>
                <div class="vc-function">
                    <div class="vc-item" onclick="${info.follow.onclick}">
                        ${info.follow.value}
                    </div>
                    <div class="vc-item" onclick="${info.block.onclick}">
                        ${info.block.value}
                    </div>
                </div>
                <div class="vc-socials ${info.socials.length ? '' : `vc-hide`}">
                    ${info.socials
                        .map((item) => {
                            return `<a href="${item.href}" title="${item.name}" target="_blank"><img src="${item.img}" alt="${info.name}"  width="16" height="16"/>${item.name}</a>`;
                        })
                        .join('')}
                </div>
                <div class="vc-topics ${info.topics.length ? '' : `vc-hide`}">
                    ${info.topics
                        .slice(0, 5)
                        .map((item) => `<a href="${item.href}" title="${item.title}">${item.title}</a>`)
                        .join('')}
                </div>
            </div>
        `;
    }
}

export default new Injected();
