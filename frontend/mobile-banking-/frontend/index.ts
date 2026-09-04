import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

const defaultErrorHandler = (global as any).ErrorUtils?.getGlobalHandler?.();

if ((global as any).ErrorUtils) {
  (global as any).ErrorUtils.setGlobalHandler(async (error: any, isFatal: boolean) => {
    console.error('GLOBAL RUNTIME ERROR CAUGHT: ', error.message);
    
    try {
      await fetch('http://192.168.1.29:5000/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          isFatal
        })
      });
    } catch (e) {
      console.error('Failed to report error to backend:', e);
    }
    
    if (defaultErrorHandler) {
      defaultErrorHandler(error, isFatal);
    }
  });
}

registerRootComponent(App);
