import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (error && error.message && error.message.includes('Failed to fetch dynamically imported module')) {
            const hasReloaded = sessionStorage.getItem('chunk_failed_reload');
            if (!hasReloaded) {
                sessionStorage.setItem('chunk_failed_reload', 'true');
                console.log('Lazy chunk missing, reloading page...');
                window.location.reload();
                return;
            }
        }

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 min-h-screen">
                    <h1 className="text-2xl font-bold text-red-800 mb-4">Noe gikk galt (White Screen Debugger)</h1>
                    <p className="text-red-700 mb-4">Her er feilmeldingen:</p>
                    <pre className="bg-white p-4 rounded border border-red-200 text-red-600 overflow-auto text-sm">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
