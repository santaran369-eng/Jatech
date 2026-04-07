import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.techjanat.app',
  appName: 'Tech Janat',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Haptics: {
      // Any specific haptics config if needed
    }
  }
};

export default config;
