import './index.scss';
import { debounce } from '../../share';

class Injected {
    constructor() {
        this.infoCache = {};
        this.domParser = new DOMParser();

        const onMouseMoveDebounce = debounce(this.onMouseMove.bind(this), 300);
        document.body.addEventListener('mousemove', onMouseMoveDebounce);
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
        const joinRank = $summary.textContent.match(/\s(\d+)\s/)[1];
        const joinTime = $summary.textContent.match(/\s(\d{4}-.*\+08:00)/)[1];
        const $activity = $summary.querySelector('a');
        const activityRank = $activity ? $activity.textContent : '';
        return {
            name,
            avatar,
            joinRank,
            joinTime,
            activityRank,
            socials: [],
            topics: [],
        };
    }

    getMemberInfo(memberUrl) {
        if (this.infoCache[memberUrl]) {
            return Promise.resolve(this.infoCache[memberUrl]);
        }
        return fetch(memberUrl)
            .then((res) => res.text())
            .then((text) => {
                this.infoCache[memberUrl] = this.getInfoFromText(text);
                return this.infoCache[memberUrl];
            });
    }

    render(event, memberInfo) {
        console.log(event, memberInfo);
    }

    onMouseMove(event) {
        const memberUrl = this.getMemberUrl(event);
        if (memberUrl) {
            this.getMemberInfo(memberUrl)
                .then((memberInfo) => {
                    this.render(event, memberInfo);
                })
                .catch((err) => {
                    console.warn(err);
                });
        }
    }
}

export default new Injected();
