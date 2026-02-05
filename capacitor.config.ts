import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.delivery.app',
  appName: 'delivery',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://spv-seven.vercel.app/',
    cleartext: true
  }
};

export default config;
