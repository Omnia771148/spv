import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leevon.delivery',
  appName: 'Leevon Delivery',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://spv-seven.vercel.app/',
    allowNavigation: ['spv-seven.vercel.app'],
    cleartext: true
  }
};

export default config;
