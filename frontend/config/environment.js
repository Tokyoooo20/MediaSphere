const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000', // Your local development backend URL
    mongoDbUrl: 'your_mongodb_atlas_dev_url'
  },
  prod: {
    apiUrl: 'https://your-production-backend-url.com', // Your production backend URL
    mongoDbUrl: 'your_mongodb_atlas_prod_url'
  }
};

const getEnvVars = (env = 'prod') => {
  if (env === 'dev') {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars; 