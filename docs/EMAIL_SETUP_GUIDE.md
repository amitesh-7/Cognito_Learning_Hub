# Email Service Setup Guide

## Overview
This guide will help you configure the email service for Cognito Learning Hub using Gmail or other SMTP providers.

## Email Templates Included

1. **Student Welcome Email** - Sent when a student registers
2. **Teacher Welcome Email** - Sent when a teacher registers  
3. **Password Reset Email** - Sent when user requests password reset
4. **Password Changed Email** - Sent after successful password change
5. **Email Verified Email** - Sent after email verification

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** section
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. In Google Account Security, go to **App passwords**
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Cognito Learning Hub"
4. Click **Generate**
5. Copy the 16-character password (remove spaces)

### Step 3: Update .env File

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@cognitolearning.com
EMAIL_FROM_NAME=Cognito Learning Hub

SUPPORT_EMAIL=support@cognitolearning.com
FRONTEND_URL=http://localhost:5173

PASSWORD_RESET_EXPIRY=3600000
EMAIL_VERIFICATION_EXPIRY=86400000
```

## Alternative SMTP Providers

### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### AWS SES

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## Testing Email Service

### 1. Verify Connection

```javascript
const emailService = require('./services/emailService');

async function testConnection() {
  const isConnected = await emailService.verifyConnection();
  console.log('Email service connected:', isConnected);
}

testConnection();
```

### 2. Test Registration Email

Register a new user through the API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "Student"
  }'
```

### 3. Test Password Reset

```bash
curl -X POST http://localhost:3001/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## Development Mode

In development (`NODE_ENV=development`):
- Email service warnings are logged but won't stop the application
- Password reset tokens are returned in the API response
- Email verification tokens are logged to console

## Production Considerations

### 1. Use Professional Email Service

For production, use a dedicated email service:
- **SendGrid** - Free tier: 100 emails/day
- **AWS SES** - $0.10 per 1,000 emails
- **Mailgun** - Free tier: 5,000 emails/month
- **Postmark** - Free tier: 100 emails/month

### 2. Email Verification

- Implement email bounces handling
- Track email delivery status
- Set up SPF, DKIM, and DMARC records
- Use a verified sending domain

### 3. Rate Limiting

- Limit password reset requests per email
- Implement cooldown periods
- Monitor for abuse

### 4. Email Queue

For high volume, implement a queue system:
- Use Redis + Bull for email queue
- Retry failed emails
- Track email metrics

## Troubleshooting

### Emails Not Sending

1. **Check .env configuration**
   ```bash
   # In auth-service directory
   echo $EMAIL_HOST
   echo $EMAIL_USER
   ```

2. **Verify Gmail App Password**
   - Must be 16 characters without spaces
   - 2FA must be enabled
   - Check Google Account security settings

3. **Check firewall/network**
   - Ensure port 587 is not blocked
   - Try port 465 with `EMAIL_SECURE=true`

4. **View logs**
   ```bash
   # Check auth-service logs
   tail -f microservices/auth-service/logs/*.log
   ```

### Common Errors

**"Invalid login: 535-5.7.8 Username and Password not accepted"**
- App password is incorrect
- 2FA not enabled
- Using regular password instead of app password

**"Connection timeout"**
- Firewall blocking SMTP
- Wrong host or port
- Network connectivity issue

**"Self-signed certificate"**
- Set `EMAIL_SECURE=false` for development
- Or set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production)

## Email Template Customization

Templates are located in: `microservices/auth-service/templates/emails/`

To customize:

1. Edit template files:
   - `studentWelcome.js`
   - `teacherWelcome.js`
   - `passwordReset.js`
   - `passwordChanged.js`
   - `emailVerified.js`

2. Update styles, content, or branding
3. Test with sample data
4. Restart auth service

## Security Best Practices

1. **Never commit credentials**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate app passwords regularly**
   - Change every 90 days
   - Use different passwords for dev/prod

3. **Implement rate limiting**
   - Already configured in auth service
   - Adjust limits based on usage

4. **Monitor email delivery**
   - Track bounce rates
   - Monitor spam reports
   - Check delivery rates

## Support

For issues or questions:
- Check logs in `microservices/auth-service/logs/`
- Review email service configuration
- Test with Gmail first before other providers
- Contact support: support@cognitolearning.com
