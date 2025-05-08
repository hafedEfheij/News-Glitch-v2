# Deployment Guide for GitHub Pages

This guide will help you deploy the محقق الأخبار (News Investigator) application to GitHub Pages with all API functionality preserved.

## Prerequisites

- A GitHub account
- A repository for your project
- Basic knowledge of Git

## Deployment Steps

### 1. Push Your Code to GitHub

1. Create a new repository on GitHub (if you haven't already)
2. Initialize Git in your project (if not already initialized):
   ```bash
   git init
   ```
3. Add your files:
   ```bash
   git add .
   ```
4. Commit your changes:
   ```bash
   git commit -m "Initial commit"
   ```
5. Add your GitHub repository as a remote:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```
6. Push your code:
   ```bash
   git push -u origin main
   ```

### 2. Set Up GitHub Secrets

This application uses several external APIs. You need to add your API keys as GitHub Secrets:

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add the following secrets:
   - Name: `GOOGLE_GENAI_API_KEY`
   - Value: Your Google Generative AI API key
   - Repeat for all other API keys:
     - `NEWS_API_KEY`
     - `FACT_CHECK_API_KEY`
     - `HF_API_KEY`
     - `CLAIMBUSTER_API_KEY`

The application uses the following APIs:

1. **Google Generative AI (Gemini)**
   - Used for AI-powered text generation and analysis

2. **NewsAPI**
   - Used for fetching news articles

3. **Google Fact Check API**
   - Used for fact-checking claims

4. **Hugging Face API**
   - Used for text summarization and fake news detection

5. **ClaimBuster API**
   - Used for scoring text for claim-worthiness

### 3. Configure GitHub Pages

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Pages"
4. Under "Source", select "GitHub Actions"
5. The workflow we've added will automatically deploy your site

### 4. Wait for the Deployment

1. Go to the "Actions" tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete
4. Your site will be available at `https://yourusername.github.io/your-repo-name/`

### 5. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your GitHub repository
2. Click on "Settings"
3. In the left sidebar, click on "Pages"
4. Under "Custom domain", enter your domain name
5. Update the DNS settings for your domain:
   - Add a CNAME record pointing to `yourusername.github.io`
   - Or add A records pointing to GitHub Pages IP addresses

## Troubleshooting

### Images or Assets Not Loading

If images or other assets are not loading, check:

1. Make sure the `basePath` and `assetPrefix` in `next.config.js` are set correctly
2. Update image paths in your code to use the `basePath`

### API Routes Not Working

If API routes are not working:

1. Make sure all required environment variables are set in GitHub Secrets
2. Check the GitHub Actions logs for any errors
3. Verify that your API routes are properly configured to work with the `basePath`

### Deployment Failing

If the deployment is failing:

1. Check the GitHub Actions logs for errors
2. Make sure your code builds successfully locally
3. Verify that all dependencies are properly installed

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
