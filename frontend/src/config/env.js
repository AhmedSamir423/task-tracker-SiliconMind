// For build-time environment variables (sensitive data)
export const buildConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
};

// For runtime environment variables (non-sensitive data)
export const runtimeConfig = {
  apiUrl: window.env?.API_URL || buildConfig.apiUrl,
  appName: window.env?.APP_NAME || 'Task Tracker',
  nodeEnv: window.env?.NODE_ENV || 'development',
};

// Export the config to use throughout your app
export default runtimeConfig;