import { isDevelopment } from '@funext/ui';
import * as React from 'react';

interface ErrorBoundaryProps{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState{
  error?: any;
  hasError?: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

  constructor(props:ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error:any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true,  error};
  }

  componentDidCatch(error:any, info:any) {
    /*
    logErrorToMyService(
      error,
      // Example "componentStack":
      //   in ComponentThatThrows (created by App)
      //   in ErrorBoundary (created by App)
      //   in div (created by App)
      //   in App
      info.componentStack,
      // Warning: `captureOwnerStack` is not available in production.
      React.captureOwnerStack(),
    );
    */
    console.log("\n\nError:")
    console.error(error)
    console.log("\n\nError info:")
    console.error(info)
    if (isDevelopment && 'captureOwnerStack' in React){
      console.log("\n\nCaptureOwnerStack:")
      //@ts-ignore
      console.error(React.captureOwnerStack())
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ?? this.state.error;
    }

    return this.props.children;
  }
}

export {
  ErrorBoundary
}

export type{
  ErrorBoundaryProps
}