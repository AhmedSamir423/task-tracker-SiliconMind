export const buildConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
};

export const runtimeConfig = {
  apiUrl: window.env?.API_URL || buildConfig.apiUrl,
  appName: window.env?.APP_NAME || 'Task Tracker',
  nodeEnv: window.env?.NODE_ENV || 'development',
};

export default runtimeConfig;
