export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'digitalcards',
    password: process.env.DATABASE_PASSWORD || 'digitalcards_dev',
    name: process.env.DATABASE_NAME || 'digitalcards',
    ssl: process.env.DATABASE_SSL === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '30d',
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      mediaBucket: process.env.S3_BUCKET_MEDIA || 'digitalcards-media',
      qrBucket: process.env.S3_BUCKET_QR || 'digitalcards-qr',
      exportsBucket: process.env.S3_BUCKET_EXPORTS || 'digitalcards-exports',
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@digitalcards.io',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  shippo: {
    apiKey: process.env.SHIPPO_API_KEY,
  },

  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  urls: {
    app: process.env.APP_URL || 'http://localhost:3000',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    shortLinkBase:
      process.env.SHORT_LINK_BASE_URL || 'http://localhost:3000/s',
  },
});
