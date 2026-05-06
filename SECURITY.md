# 🔐 Security Implementation Guide

## Overview

This document details the security measures implemented in the Electric ERP authentication system and best practices for maintaining security.

## 🛡️ Security Layers

### 1. Password Security

#### Implementation
```javascript
// Using bcryptjs with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

#### Best Practices
- ✅ Never store plain text passwords
- ✅ Use bcryptjs (PBKDF2/bcrypt, never MD5/SHA1)
- ✅ Minimum 8 characters required
- ✅ Salt rounds: 10 (takes ~100ms to hash)
- ✅ Validate on both client and server

#### Recommendations
- Add password strength meter to UI
- Reject common passwords (use library like `zxcvbn`)
- Implement password history (prevent reuse)

---

### 2. Token Security

#### JWT Tokens
```
Access Token (15 min):
- Short expiration
- Used for API requests
- Stored in HttpOnly cookie

Refresh Token (7 days):
- Longer expiration
- Used to issue new access tokens
- Stored separately in HttpOnly cookie
```

#### Implementation
```javascript
// Token generation
const accessToken = jwt.sign(
  { userId, email },
  ACCESS_TOKEN_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { userId, email },
  REFRESH_TOKEN_SECRET,
  { expiresIn: '7d' }
);
```

#### Best Practices
- ✅ Sign tokens with strong secret (32+ characters)
- ✅ Include minimal claims (userId, email only)
- ✅ Verify signature on every request
- ✅ Check expiration time
- ✅ Implement token blacklist for logout (optional)

#### Cookie Settings
```javascript
{
  httpOnly: true,      // No JavaScript access
  sameSite: 'lax',     // CSRF protection
  secure: true,        // HTTPS only (production)
  maxAge: 900000       // 15 minutes for access token
}
```

---

### 3. HttpOnly Cookies

#### Why HttpOnly?
- ❌ XSS cannot access tokens
- ❌ Prevents token theft
- ✅ Browser handles automatically
- ✅ CSRF can't read cookies

#### Implementation
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,    // Essential!
  sameSite: 'lax',   // CSRF protection
  secure: isProduction,
  maxAge: 15 * 60 * 1000
});
```

#### Limitations
- Frontend cannot read token value
- Must use GET `/api/auth/me` to verify session
- RTK Query handles this automatically

---

### 4. CORS Security

#### Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Whitelist only
  credentials: true,                  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Best Practices
- ✅ Whitelist only trusted origins
- ✅ Enable credentials for cookie requests
- ✅ Restrict HTTP methods
- ✅ No wildcard (*) origin in production

#### Testing CORS
```bash
curl -i -X OPTIONS http://localhost:4000/api/auth/me \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

---

### 5. Input Validation

#### Server-Side
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// Password length
if (password.length < 8) {
  return res.status(400).json({ error: 'Password too short' });
}
```

#### Client-Side
```javascript
// React validation (complementary)
const [email, setEmail] = useState('');
const [errors, setErrors] = useState({});

function validate() {
  const newErrors = {};
  if (!email) newErrors.email = 'Email required';
  if (password.length < 8) newErrors.password = 'Min 8 chars';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}
```

#### Best Practices
- ✅ Always validate on server
- ✅ Client-side is UX enhancement only
- ✅ Sanitize all inputs
- ✅ Reject unexpected data types

---

### 6. Error Handling

#### Secure Error Messages
```javascript
// ✅ Good - Generic message
res.status(401).json({ error: 'Invalid email or password' });

// ❌ Bad - Reveals user existence
res.status(401).json({ error: 'User not found' });

// ❌ Bad - Exposes system details
res.status(500).json({ error: error.stack });
```

#### Implementation
```javascript
try {
  // Auth logic
} catch (error) {
  console.error(error);  // Log for debugging
  res.status(500).json({ error: 'Failed to process request' });
}
```

#### Best Practices
- ✅ Generic messages to clients
- ✅ Log details server-side
- ✅ Never expose stack traces
- ✅ Don't reveal user existence
- ✅ Don't disclose data structure

---

### 7. Rate Limiting

#### Why Important
- Prevents brute force attacks
- Protects against DDoS
- Limits password reset abuse

#### Implementation Example
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests per window
  skipSuccessfulRequests: true,
  message: 'Too many failed attempts'
});

router.post('/login', loginLimiter, login);
```

#### Recommended Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 | 15 min |
| Forgot Password | 3 | 1 hour |
| Reset Password | 3 | 1 hour |
| API endpoints | 100 | 15 min |

---

### 8. Password Reset Security

#### Token Generation
```javascript
// Cryptographically secure random bytes
const resetToken = crypto.randomBytes(32).toString('hex');

// Hash before storing (can't recover original)
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

// Store with expiration
await pool.query(
  'UPDATE users SET reset_password_token = $1, reset_password_expires = $2',
  [hashedToken, expiresAt]
);
```

#### Best Practices
- ✅ Use crypto-secure random (not Math.random)
- ✅ Hash tokens before storage
- ✅ Expire tokens quickly (1 hour)
- ✅ Delete after use
- ✅ One token per request

#### Flow
```
1. User enters email
2. Backend generates reset token
3. Hash and store with expiration
4. Send unhashed token via email
5. User clicks link with token
6. Backend hashes received token
7. Compare with stored hash
8. If valid, clear reset token
```

---

### 9. HTTPS/SSL

#### Development
```env
NODE_ENV=development
# secure: false in cookies
```

#### Production
```env
NODE_ENV=production
# secure: true in cookies
# Requires valid SSL certificate
```

#### Setup Options
- **Let's Encrypt** - Free, auto-renew
- **AWS Certificate Manager** - Free on AWS
- **Cloudflare** - Free SSL + DDoS protection
- **Paid CAs** - DigiCert, Sectigo, etc.

#### Testing HTTPS
```bash
# Generate self-signed cert (testing only)
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

---

### 10. Logging & Monitoring

#### Recommended Logs
```javascript
// Login attempts
console.log(`[AUTH] Login attempt: ${email}`);
console.log(`[AUTH] Login success: ${userId}`);
console.log(`[AUTH] Login failed: ${email} - invalid password`);

// Token events
console.log(`[TOKEN] Refreshed: ${userId}`);
console.log(`[TOKEN] Invalid: ${reason}`);

// Password reset
console.log(`[RESET] Request: ${email}`);
console.log(`[RESET] Complete: ${userId}`);
```

#### Monitoring
- Track failed login attempts
- Alert on multiple failed attempts
- Monitor password reset abuse
- Log token verification failures
- Track unusual IP addresses

#### Tools
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- DataDog
- New Relic
- CloudWatch (AWS)

---

## 🔐 Production Checklist

### Before Deployment

- [ ] **Change JWT Secrets**
  ```bash
  openssl rand -base64 32
  ```

- [ ] **Enable HTTPS**
  - [ ] Get SSL certificate
  - [ ] Set secure: true
  - [ ] Redirect HTTP → HTTPS

- [ ] **Configure Environment**
  - [ ] Set NODE_ENV=production
  - [ ] Update FRONTEND_URL
  - [ ] Setup DATABASE_URL

- [ ] **Email Service**
  - [ ] Verify Resend API key
  - [ ] Setup email domain
  - [ ] Test email delivery

- [ ] **Database**
  - [ ] Use strong password
  - [ ] Enable backups
  - [ ] Setup monitoring
  - [ ] Create test users

- [ ] **Rate Limiting**
  - [ ] Implement login limits
  - [ ] Implement password reset limits
  - [ ] Monitor for abuse

- [ ] **Logging**
  - [ ] Setup centralized logging
  - [ ] Configure alerts
  - [ ] Monitor failed attempts

- [ ] **CORS**
  - [ ] Remove localhost origins
  - [ ] Whitelist production domain only
  - [ ] Test cross-origin requests

- [ ] **Security Headers**
  ```javascript
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  ```

---

## 🚨 Incident Response

### Account Compromise
1. Force password reset
2. Clear all sessions
3. Review login history
4. Check API usage
5. Enable 2FA if available

### Brute Force Attack
1. Block IP address
2. Enable rate limiting
3. Alert security team
4. Review logs
5. Reset affected accounts

### Token Leak
1. Invalidate token immediately
2. Issue new token
3. Clear refresh tokens
4. Audit usage
5. Review log access

---

## 📊 Security Testing

### Automated Testing
```bash
# Check dependencies for vulnerabilities
npm audit

# OWASP dependency check
npx audit-ci --moderate
```

### Manual Testing
```bash
# Test CORS
curl -i -X OPTIONS http://localhost:4000/api/auth/me

# Test XSS protection (should not access token)
document.cookie  # Empty

# Test password hashing
bcrypt.compare('wrong', hash)  # Should be false
```

### Penetration Testing
- SQLi - Not applicable (using parameterized queries)
- XSS - Protected (HttpOnly cookies, no token in DOM)
- CSRF - Protected (SameSite=Lax)
- Brute force - Add rate limiting

---

## 🔗 References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

## 🆘 Getting Help

For security issues:
1. **Do NOT** post publicly
2. Contact security team privately
3. Include details and reproduction steps
4. Allow time for a fix (90 days)

---

**Last Updated:** 2026  
**Maintained By:** Electric ERP Team
