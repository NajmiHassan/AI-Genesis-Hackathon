# Receipt Parser Pro

A web application that extracts expense data from receipt images using AI and saves it directly to Notion databases.

## What It Does

This app processes receipt images through a simple three-step workflow:

1. **Configure Notion**: Enter your Notion API key and database ID
2. **Upload Receipts**: Select one or more receipt images (supports drag-and-drop)
3. **Process & Save**: The app extracts text using Google's Gemini AI, structures the data (merchant, date, total, line items), and saves it to your Notion database

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **AI/OCR**: Google Gemini API (gemini-2.5-flash model)
- **Database**: Notion API
- **Build Tool**: Vite

## Prerequisites

- Node.js installed
- A Google Gemini API key
- A Notion integration token with access to a database

## Notion Database Setup

Your Notion database should have these properties:
- **Name** (Title) - Auto-generated from merchant and date
- **Merchant** (Text/Rich Text)
- **Date** (Date)
- **Total** (Number)
- **Items** (Text/Rich Text)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Image to Text**: Gemini's vision model extracts all visible text from the receipt image
2. **Text to Structure**: A second Gemini call uses JSON mode with a defined schema to parse the text into structured expense data
3. **Save to Notion**: The structured data is sent to Notion's API via a CORS proxy

## Limitations

- Uses a CORS proxy for Notion API calls (suitable for demos; production apps should use a backend)
- Gemini API key is embedded in the client (consider server-side implementation for production)
- Text extraction accuracy depends on receipt image quality
- Rich text fields are limited to 2000 characters

## Project Structure

```
├── App.tsx                      # Main application component
├── components/
│   ├── ImageUploader.tsx        # File upload with drag-and-drop
│   ├── NotionCredentials.tsx    # Notion API configuration form
│   ├── ResultsDashboard.tsx     # Results display with status tracking
│   └── icons.tsx                # SVG icon components
├── services/
│   ├── geminiService.ts         # Gemini API integration
│   └── notionService.ts         # Notion API integration
├── types.ts                     # TypeScript type definitions
└── index.tsx                    # Application entry point
```

## License

This project was created as a demonstration of AI-powered document processing.
