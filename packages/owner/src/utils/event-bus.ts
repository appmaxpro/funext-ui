export class EventBus extends EventTarget {
  on(event: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
    this.addEventListener(event, listener, options);
    return () => {
      this.removeEventListener(event, listener, options);
    };
  }

  off(event: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) {
    this.removeEventListener(event, listener, options);
  }

  trigger(name: string, payload?: any) {
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }
}