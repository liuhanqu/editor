const _now = () => +new Date();

const WAIT = 20;

export function throttle(fn: Function, wait: number = WAIT) {
  let last: number;
  return function(...args: any[]) {
    const now = _now();
    if (!last) {
      last = now;
    }
    if (wait + last - now < 0) {
      last = _now();
      const result = fn(...args);
      return result;
    }
  };
}

export function debounce(fn: Function, wait: number) {
  let timer: number | null;
  return function(...args: any[]) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = window.setTimeout(function() {
      timer = null;
      const result = fn(...args);
      return result;
    }, wait);
  };
}
