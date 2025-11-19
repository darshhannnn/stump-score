// Set up test environment variables
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.SMTP_FROM = 'StumpScore Test <test@example.com>';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret';
