import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'xyz.chumankee.booking',
  appName: 'chu man kee booking',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'always',
  },
}

export default config
