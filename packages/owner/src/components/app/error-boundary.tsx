import * as React from 'react';
import { isDevelopment } from '~/utils';


type OnReset = () => void;

export type FallbackProps = {
  error?: any;
  onReset?: OnReset;
};

type Fallback = React.ElementType<FallbackProps>
interface ErrorBoundaryProps{
  children: React.ReactNode;
  fallback?: React.ReactNode | Fallback;
  onError?(error:any, info:any): void;
  onReset?: OnReset;
}

interface ErrorBoundaryState{
  error?: any;
  hasError?: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

  constructor(props:ErrorBoundaryProps) {
    console.log("ErrorBoundary:", props)
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error:any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true,  error};
  }

  componentDidCatch(error:any, info:any) {
    if(this.props.onError) {
      this.props.onError(error, info);
    }
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
      //console.error(React.captureOwnerStack())
    }
  }

  render() {
    if (this.state.hasError) {
      console.log("ErrorBoundary error:", this.state.error)
      // You can render any custom fallback UI
      if (typeof this.props.fallback  === 'function') {
        const C =  this.props.fallback as Fallback;
        return <C error={this.state.error} onReset={this.props.onReset}/>
      }
      return this.props.fallback ?? this.state.error.message;
    }

    return this.props.children;
  }
}

(ErrorBoundary as any).displayName = "ErrorBoundary";

export {
  ErrorBoundary
}

export type{
  ErrorBoundaryProps
}