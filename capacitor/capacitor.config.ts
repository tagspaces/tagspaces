import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.tagspaces.mobileapp',
  appName: 'TagSpaces',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
    },
  },
  android: {
    minWebViewVersion: 70,
  },
  ios: {
    scheme: 'TagSpaces',
    contentInset: 'always',
  },
};

export default config;
