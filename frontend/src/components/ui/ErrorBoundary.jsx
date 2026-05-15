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
          style={{ background: '#0a0c18' }}
        >
          <div className="text-center max-w-md animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              <AlertTriangle size={36} style={{ color: '#f87171' }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#e2e8f0' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-2" style={{ color: '#566082' }}>
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.error && (
              <pre
                className="text-xs text-left mt-4 p-4 rounded-xl overflow-auto max-h-32"
                style={{ background: '#1c2236', border: '1px solid #2a3250', color: '#f87171' }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#1c2236', border: '1px solid #2a3250', color: '#94a3b8' }}
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
