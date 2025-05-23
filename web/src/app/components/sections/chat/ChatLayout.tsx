"use client"

import { useState, useEffect, useMemo } from 'react';
import { Header } from '../header/Header';
import { Footer } from '../footer/Footer';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '../../../context/ChatContext';
import { useDebounce } from '../../../hooks/useDebounce';
import React, { Component, ErrorInfo, ReactNode } from 'react';

class ChatErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught error', error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col h-screen items-center justify-center bg-white dark:bg-black text-black dark:text-white">
          <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
          <p className="mb-4">Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ChatLayout() {
  const { isLoading } = useChat();
  const [mounted, setMounted] = useState(false);
  const debouncedLoading = useDebounce(isLoading, 300); // Debounce loading state to prevent flickering

  // Safe mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the loading indicator to prevent unnecessary re-renders
  const loadingIndicator = useMemo(() =>
    debouncedLoading && (
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 flex items-center space-x-2">
        <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-pulse delay-150"></div>
        <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-pulse delay-300"></div>
      </div>
    ), [debouncedLoading]);

  // Memoize the skeleton loading state to prevent re-renders
  const loadingSkeleton = useMemo(() => (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-md w-full"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md w-5/6"></div>
      </div>
    </div>
  ), []);

  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {loadingSkeleton}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ChatMessageList />
          {loadingIndicator}

          <div className="px-4 py-3 w-full border-t border-gray-200 dark:border-gray-800">
            <ChatInput />
          </div>
        </main>

        <Footer />
      </div>
    </ChatErrorBoundary>
  );
}
