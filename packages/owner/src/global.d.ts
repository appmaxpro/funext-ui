
declare global {
  interface Window {
    webkit?; any;
    appInterface?: any;
    navigation: Navigation;
    handleLoginToken(token): void;
    updateNotificationToken(token): void;
  }
  interface NavigateEvent extends Event{
    readonly type: 'navigate'
    readonly canIntercept: boolean;
    readonly destination: NavigationDestination;
    readonly downloadRequest: string | null;
    readonly hashChange: boolean;
    readonly info?: any | null;
    readonly navigationType: 'push' | 'reload' | 'replace' | 'traverse';
    readonly signal?: AbortSignal;
    intercept(options?: any);

  }
}

declare module "*.txt" {
  const content: string;
  export default content;
}

declare module "*.xml" {
  const content: string;
  export default content;
}
// At least one export statement
export {};