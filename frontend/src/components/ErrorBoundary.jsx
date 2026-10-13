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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-3xl shadow-sm text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-800">Đã xảy ra sự cố khi tải trang</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống phát hiện lỗi hiển thị giao diện. Bạn có thể nhấn nút bên dưới để khôi phục hoặc quay về trang chính.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Khôi phục / Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
