const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  
  // Validate MongoDB URI format
  if (!process.env.MONGO_URI.startsWith('mongodb')) {
    throw new Error('Invalid MongoDB URI format');
  }
};

module.exports = validateEnv;
