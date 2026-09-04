import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error, errorInfo });
    console.error('ERROR BOUNDARY CAUGHT:', error);
    console.error('COMPONENT STACK:', errorInfo.componentStack);

    fetch('http://192.168.1.29:5000/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack?.substring(0, 2000)
      })
    }).catch(e => console.error('Failed to log error', e));
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ padding: 20, marginTop: 50 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red' }}>Render Error Caught!</Text>
          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</Text>
          <Text style={{ marginTop: 10 }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
