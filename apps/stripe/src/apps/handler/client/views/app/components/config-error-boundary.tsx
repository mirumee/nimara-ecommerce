import { Component, type ReactNode } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";

export class ConfigErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null };

  static getDerivedStateFromError({ message }: Error) {
    return { message };
  }

  render() {
    if (!this.state.message) {
      return this.props.children;
    }

    return (
      <Alert variant="destructive">
        <AlertTitle>Configuration unavailable</AlertTitle>
        <AlertDescription>{this.state.message}</AlertDescription>
      </Alert>
    );
  }
}
