export function string(value) {
  return Object.prototype.toString.call(value) === '[object String]';
}

export function promise(value) {
  return Object.prototype.toString.call(value) === '[object Promise]';
}

export function element(value) {
  return value && value instanceof HTMLElement && value.nodeType === 1;
}