# محقق الأخبار - News Investigator

This is a Next.js application that aggregates and displays news from various Arabic sources, with a focus on Libyan news. This version is configured for deployment to GitHub Pages.

## Features

- Breaking news section with real-time updates
- Libya-focused news section
- Categorized news by topic
- Latest news from various sources
- RTL support for Arabic content
- Responsive design for all device sizes
- AI-powered news analysis and fact-checking

## GitHub Pages Deployment

This project is configured to deploy to GitHub Pages using GitHub Actions. The deployment workflow will:

1. Build the Next.js application
2. Export it as static HTML
3. Deploy it to GitHub Pages

## APIs and External Services

This application uses several external APIs to provide its functionality:

1. **Google Generative AI (Gemini)**
   - Used for AI-powered text generation, summarization, and analysis
   - Requires an API key to be set as a GitHub Secret

2. **NewsAPI**
   - Used for fetching news articles from various sources
   - Requires an API key to be set as a GitHub Secret

3. **Google Fact Check API**
   - Used for searching for fact checks related to claims
   - Requires an API key to be set as a GitHub Secret

4. **Hugging Face API**
   - Used for text summarization and fake news detection
   - Models used:
     - `facebook/bart-large-cnn` (summarization)
     - `mrm8488/bert-tiny-finetuned-fake-news-detection` (fake news detection)
   - Requires an API key to be set as a GitHub Secret

5. **ClaimBuster API**
   - Used for scoring text for claim-worthiness
   - Requires an API key to be set as a GitHub Secret

6. **RSS Feeds**
   - Used for fetching news from various Arabic news sources
   - No API key required

See the `GITHUB_PAGES_DEPLOYMENT_GUIDE.md` file for instructions on setting up the required API keys as GitHub Secrets.

## Development

To run this project locally:

```bash
npm install
npm run dev
```

## Building for Production

To build the project for production:

```bash
npm run build
```

## Deployment

The project is automatically deployed to GitHub Pages when changes are pushed to the main branch. See the `.github/workflows/deploy.yml` file for details.

## Customization

To customize this project for your own use:

1. Fork the repository
2. Update the environment variables in GitHub Secrets
3. Modify the content and styling as needed
4. Push your changes to trigger a deployment

## License

This project is open source and available under the MIT License.
