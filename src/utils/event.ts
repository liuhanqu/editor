interface EventMap {
  [propName: string]: (evt: MouseEvent) => void
}

export function addEventsToDocument(eventMap: EventMap) {
  Object.keys(eventMap).forEach(key => {
    document.addEventListener(key, eventMap[key]);
  });
}

export function removeEventsFromDocument(eventMap: EventMap) {
  Object.keys(eventMap).forEach(key => {
    document.removeEventListener(key, eventMap[key]);
  });
}

export function getMousePosition(evt: MouseEvent) {
  return {
    x: evt.pageX - (window.scrollX || window.pageXOffset),
    y: evt.pageY - (window.scrollY || window.pageYOffset),
  };
}
