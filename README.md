# Article Scrapper

> BeyondChat Home Assignment - An automated article scraping and content enhancement system

## 📋 Overview

- Article Scrapper is a Node.js application that scrapes oldest 5 articles from BeyondChats blog site, stores them in MongoDB.
- Searches the stored articles on Google and enhances the content using Google's Generative AI using the top 2 search results.
- The application provides RESTful APIs to manage and retrieve articles.

## ✨ Features

- 🔍 **Automated Web Scraping**: Searches and scrapes articles from Google search results
- 🤖 **AI-Powered Content Enhancement**: Uses Google Generative AI to improve article content
- 💾 **MongoDB Integration**: Persistent storage with Mongoose ODM
- 🚀 **RESTful API**: Full CRUD operations for article management
- ⚡ **Express.js Backend**: Fast and minimalist web framework
- 🔄 **Auto-seeding**: Automatically populates the database on startup

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or MongoDB Atlas account)
- **Google Cloud Account** (for Generative AI API)
- **Google Custom Search API** credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kumarsonsoff3/ArticleScrapper.git
   cd ArticleScrapper
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000

   # MongoDB Atlas
   # MONGO_URI=YOUR_MONGODB_UNIFORM_RESOURCE_IDENTIFIER

   # Google Generative AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # Google Custom Search Configuration
   GOOGLE_API_KEY=your_google_api_key_here
   GOOGLE_CSE_ID=your_search_engine_id_here
   ```

4. **Set up Google API Credentials**

   **For Generative AI (Gemini):**

   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Add it to your `.env` as `GEMINI_API_KEY`

   **For Custom Search:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search API
   - Create credentials and get your API key
   - Create a Custom Search Engine at [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Get your Search Engine ID
   - Add both to your `.env`

5. **Run the application**
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT)

## 🏗️ Project Architecture

```
BeyondChat/
├── app.js                      # Application entry point
├── package.json                # Project dependencies and scripts
├── config/
│   └── db.js                   # MongoDB connection configuration
├── controllers/
│   └── articleController.js    # Request handlers for article operations
├── models/
│   └── article.js              # Mongoose schema for articles
├── routes/
│   └── articleRoutes.js        # API route definitions
└── utils/
    ├── contentEnhancer.js      # AI-powered content enhancement logic
    ├── rewriteArticle.js       # Article rewriting utilities
    ├── scraper.js              # Web scraping and seeding logic
    └── searchGoogle.js         # Google search integration
```

## 🔧 Configuration

### Scraping Configuration

Modify the scraping behavior in `utils/scraper.js`:

- Change search queries
- Adjust number of articles to scrape
- Customize scraping logic

### Content Enhancement

Configure AI enhancement in `utils/contentEnhancer.js`:

- Adjust AI model parameters
- Customize enhancement prompts
- Control batch processing

## 📝 Development

### Project Structure Patterns

- **MVC Pattern**: Separation of concerns with Models, Views (API responses), and Controllers
- **Modular Architecture**: Organized utility functions for specific tasks
- **Environment-based Configuration**: Secure credential management
- **RESTful API Design**: Standard HTTP methods for CRUD operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -s -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

**Note**: Ensure you comply with Google's Terms of Service and rate limits when using their APIs. Always respect website robots.txt files when scraping content.
