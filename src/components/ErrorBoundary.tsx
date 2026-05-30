import { Component, type ReactNode } from "react";
import { Icon } from "./Icon";

/* Keeps a single misbehaving tool from blanking the whole app. Resets when the
   active tool changes (via the `resetKey` prop). */
export class ErrorBoundary extends Component<
  { resetKey: string | null; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey: string | null }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ws-body">
          <div className="err-banner" style={{ margin: 22 }}>
            <span className="eb-ico"><Icon name="alert" /></span>
            <div>
              <div className="eb-ttl">This tool hit an error</div>
              <div className="eb-msg">{this.state.error.message}</div>
              <button className="btn sm" style={{ marginTop: 10 }} onClick={() => this.setState({ error: null })}>
                <Icon name="refresh" /> Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
