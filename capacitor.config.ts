import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.akalp.petpomodoro',
  appName: 'PetPomodoro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
