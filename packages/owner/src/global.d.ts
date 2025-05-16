
declare global {
  interface Window {
    webkit?; any;
    appInterface?: any;
    handleLoginToken(token): void;
    updateNotificationToken(token): void;
  }
}

// At least one export statement
export {};