# AWS Deployment Guide

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- EB CLI installed (`pip install awsebcli`)
- Node.js 18+ installed locally
- Domain configured (optional)

## Part 1: Backend Deployment (Elastic Beanstalk)

### Step 1: Prepare the Backend

```bash
cd server
npm install
npm run build
```

### Step 2: Initialize Elastic Beanstalk

```bash
# Initialize EB application
eb init -p node.js-18 ilex-preonboarding-backend --region us-east-1

# Follow prompts:
# - Select your region
# - Enter application name
# - Select Node.js 18 running on 64bit Amazon Linux 2
# - Do not use CodeCommit
```

### Step 3: Create Environment

```bash
# Create production environment
eb create production

# This will:
# - Create an EC2 instance
# - Set up load balancer
# - Configure auto-scaling
# - Deploy your application
```

### Step 4: Configure Environment Variables

Option A - Via AWS Console:
1. Go to AWS Console → Elastic Beanstalk
2. Select your application
3. Go to Configuration → Software
4. Add environment properties:

```
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-cloudfront-domain.com
AWS_REGION=us-east-1
AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_SMTP_PORT=587
AWS_SES_SMTP_USER=your-smtp-username
AWS_SES_SMTP_PASS=your-smtp-password
SENDER_EMAIL=notification@ilex.sg
INTERCOM_APP_ID=your-intercom-app-id
MAX_FILE_SIZE=1073741824
CORS_ORIGIN=https://your-cloudfront-domain.com
```

Option B - Via EB CLI:

```bash
eb setenv NODE_ENV=production PORT=8080 FRONTEND_URL=https://your-cloudfront-domain.com AWS_REGION=us-east-1 AWS_SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com AWS_SES_SMTP_PORT=587 AWS_SES_SMTP_USER=your-username AWS_SES_SMTP_PASS=your-password SENDER_EMAIL=notification@ilex.sg INTERCOM_APP_ID=your-id MAX_FILE_SIZE=1073741824 CORS_ORIGIN=https://your-cloudfront-domain.com
```

### Step 5: Configure Instance Type (Optional)

For better performance:

```bash
# Edit .elasticbeanstalk/config.yml and add:
deploy:
  artifact: dist.zip

environment:
  group_suffix: production
  instance_type: t3.medium
```

### Step 6: Deploy Updates

```bash
# Deploy new version
eb deploy

# Open application
eb open

# Check status
eb status

# View logs
eb logs
```

### Step 7: Set Up HTTPS (Recommended)

1. Go to AWS Certificate Manager
2. Request a certificate for your domain
3. In EB Console → Configuration → Load Balancer
4. Add listener on port 443 with your certificate
5. Redirect port 80 to 443

---

## Part 2: Frontend Deployment (S3 + CloudFront)

### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://ilex-preonboarding-frontend --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://ilex-preonboarding-frontend --index-document index.html --error-document index.html
```

### Step 2: Configure Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ilex-preonboarding-frontend/*"
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-policy --bucket ilex-preonboarding-frontend --policy file://bucket-policy.json
```

### Step 3: Build Frontend

```bash
cd client

# Update .env for production
cat > .env << EOF
REACT_APP_API_URL=https://your-backend-domain.elasticbeanstalk.com/api
REACT_APP_DOMAIN_TO_TEST=https://institutionallendingexchange.com
REACT_APP_INTERCOM_APP_ID=your-intercom-app-id
EOF

# Build
npm run build
```

### Step 4: Deploy to S3

```bash
# Upload build files
aws s3 sync build/ s3://ilex-preonboarding-frontend --delete

# Set cache control headers
aws s3 cp s3://ilex-preonboarding-frontend s3://ilex-preonboarding-frontend \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control max-age=31536000,public \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Don't cache HTML files
aws s3 cp s3://ilex-preonboarding-frontend s3://ilex-preonboarding-frontend \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control no-cache,no-store,must-revalidate \
  --include "*.html" \
  --include "service-worker.js"
```

### Step 5: Create CloudFront Distribution

```bash
# Create distribution configuration
cat > cf-config.json << EOF
{
  "CallerReference": "ilex-preonboarding-$(date +%s)",
  "Comment": "ILex Pre-Onboarding Frontend",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-ilex-preonboarding-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-ilex-preonboarding-frontend",
        "DomainName": "ilex-preonboarding-frontend.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

# Create distribution
aws cloudfront create-distribution --distribution-config file://cf-config.json
```

Or use AWS Console:
1. Go to CloudFront
2. Create Distribution
3. Origin: Your S3 bucket
4. Viewer Protocol Policy: Redirect HTTP to HTTPS
5. Compress Objects Automatically: Yes
6. Default Root Object: index.html
7. Error Pages: 404 → /index.html (200)

### Step 6: Configure Custom Domain (Optional)

1. In Route 53, create A record
2. Alias to CloudFront distribution
3. Add alternate domain name in CloudFront
4. Add ACM certificate

---

## Part 3: AWS SES Configuration

### Step 1: Verify Email Address

```bash
# Verify sender email
aws ses verify-email-identity --email-address notification@ilex.sg --region us-east-1
```

Check your email and click verification link.

### Step 2: Request Production Access

1. Go to AWS SES Console
2. Click "Request Production Access"
3. Fill out form with:
   - Use case: Transactional emails for pre-onboarding tests
   - Expected volume: Low (<1000/day)
   - Handle bounces: Yes, via SNS
4. Wait for approval (24-48 hours)

### Step 3: Generate SMTP Credentials

1. Go to SES Console → SMTP Settings
2. Click "Create My SMTP Credentials"
3. Save username and password
4. Update backend environment variables

### Step 4: Configure DNS Records (Optional but Recommended)

Add to your domain DNS:

**SPF Record:**
```
v=spf1 include:amazonses.com ~all
```

**DKIM Records:**
1. Go to SES Console → Domains → Your Domain
2. Copy the 3 DKIM records
3. Add to your DNS provider

---

## Part 4: Monitoring & Logging

### CloudWatch Logs

Backend logs are automatically available:

```bash
# View logs
eb logs

# Tail logs
eb logs --stream
```

### CloudWatch Metrics

Monitor in AWS Console:
- Request count
- Error rate
- CPU utilization
- Network throughput

### Set Up Alarms

```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name "ilex-backend-high-errors" \
  --alarm-description "Alert when error rate is high" \
  --metric-name "5XXError" \
  --namespace "AWS/ElasticBeanstalk" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 1
```

---

## Part 5: CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Backend
        run: |
          cd server
          npm install
          npm run build
          pip install awsebcli
          eb deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Frontend
        run: |
          cd client
          npm install
          npm run build
          aws s3 sync build/ s3://ilex-preonboarding-frontend --delete
          aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## Troubleshooting

### Backend Not Starting
- Check environment variables are set
- Check CloudWatch logs: `eb logs`
- Verify port 8080 is used (EB requirement)

### CORS Errors
- Verify CORS_ORIGIN matches CloudFront URL
- Check browser console for exact error
- Ensure preflight requests are handled

### Email Not Sending
- Verify SES is out of sandbox mode
- Check SMTP credentials are correct
- Review CloudWatch logs for SES errors
- Verify sender email is verified

### CloudFront Not Updating
- Create invalidation: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`
- Clear browser cache
- Wait 5-10 minutes for propagation

---

## Cost Estimation

### Monthly Costs (Low Traffic - ~1000 tests/month)

- **Elastic Beanstalk (t3.micro)**: $8-10
- **S3 Storage (1GB)**: $0.02
- **CloudFront (10GB transfer)**: $1.00
- **SES (1000 emails)**: $0.10
- **Total**: ~$10-15/month

### Scaling Up (10,000 tests/month)

- **EB (t3.small with auto-scaling)**: $20-30
- **CloudFront (100GB)**: $8.50
- **SES (10,000 emails)**: $1.00
- **Total**: ~$30-40/month

---

## Security Checklist

- [ ] HTTPS enabled on CloudFront
- [ ] HTTPS enabled on Elastic Beanstalk
- [ ] Environment variables not committed to git
- [ ] IAM roles with least privilege
- [ ] S3 bucket not publicly listable
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] SES in production mode
- [ ] CloudWatch alarms configured
- [ ] Regular security updates

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review CloudWatch logs for errors
- Check SES bounce rates

**Monthly:**
- Update dependencies: `npm outdated`
- Review AWS costs
- Check SSL certificate expiry

**As Needed:**
- Deploy updates: `eb deploy` and `aws s3 sync`
- Scale instances if traffic increases
- Optimize costs based on usage patterns
