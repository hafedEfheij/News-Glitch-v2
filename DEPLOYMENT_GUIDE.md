# Deployment Guide for Glitch

This guide will help you deploy the محقق الأخبار (News Investigator) application to Glitch.

## Prerequisites

- A Glitch account (sign up at [glitch.com](https://glitch.com) if you don't have one)
- The project files prepared for deployment

## Deployment Steps

### 1. Create a New Project on Glitch

1. Log in to your Glitch account
2. Click on "New Project" in the Glitch dashboard
3. Select "Import from GitHub" or "Clone from Git URL"

### 2. Import the Project

If you have the project on GitHub:
1. Enter the GitHub repository URL
2. Click "OK" to import the project

If you're uploading directly:
1. Select "Import from GitHub"
2. When the dialog appears, click on "Advanced Options"
3. Select "Upload your own files"
4. Zip your project directory and upload it

### 3. Configure Environment Variables

1. In your Glitch project, click on the "Tools" button at the bottom of the page
2. Select ".env" from the dropdown menu
3. Add the following environment variables:
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```
4. Click "Save" to save your environment variables

### 4. Wait for the Build Process

Glitch will automatically detect the project type and start the build process. This may take a few minutes.

### 5. View Your Deployed Application

Once the build process is complete, you can view your application by clicking on the "Show" button at the top of the page.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Glitch logs by clicking on "Tools" > "Logs"
2. Make sure all required environment variables are set
3. Ensure the project has the correct structure and configuration files

## Custom Domain (Optional)

To use a custom domain with your Glitch project:

1. Click on "Share" in your project
2. Click on "Change URL" to set a custom Glitch subdomain
3. For a completely custom domain, click on "Settings" > "Custom Domain"
4. Follow the instructions to configure your domain

## Maintaining Your Application

- Glitch automatically saves changes as you make them
- The application will restart when necessary based on the watch.json configuration
- You can edit files directly in the Glitch editor

## Resources

- [Glitch Help Center](https://help.glitch.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Glitch Support Forum](https://support.glitch.com/)
