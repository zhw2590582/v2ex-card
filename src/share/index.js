export function sleep(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function addClass(target, className) {
    return target.classList.add(className);
}

export function removeClass(target, className) {
    return target.classList.remove(className);
}
