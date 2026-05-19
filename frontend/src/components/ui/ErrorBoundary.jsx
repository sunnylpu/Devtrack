import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-8"
          style={{ background: 'var(--bg)' }}
        >
          <div className="text-center max-w-md animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              <AlertTriangle size={36} style={{ color: 'var(--danger)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-2" style={{ color: 'var(--subtle)' }}>
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.error && (
              <pre
                className="text-xs text-left mt-4 p-4 rounded-xl overflow-auto max-h-32"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--danger)' }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
