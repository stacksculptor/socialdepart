# T3 Gallery

A Next.js application built with the T3 stack for PDF upload and marketing strength generation.

## Features

- PDF upload with authentication
- Marketing strength generation using OpenAI
- User authentication with Clerk
- Modern UI with Shadcn UI and Tailwind CSS

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```

Add the following to your `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/t3gallery"

# OpenAI API Key (required for marketing strength generation)
OPENAI_API_KEY="your-openai-api-key-here"
```

3. Set up the database:
```bash
pnpm db:push
```

4. Start the development server:
```bash
pnpm dev
```

## Marketing Strength Generation

The application includes a marketing strength generation feature that uses OpenAI's GPT-4 model to create compelling marketing content based on:

- Campaign parameters (selected episodes, goals, KPIs)
- Audience profile (gender, ethnicity, age, preferences)

The system generates 3 unique variations of marketing strength content, each optimized for different use cases and perspectives.

## Tech Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma
- **UI**: Shadcn UI + Tailwind CSS
- **AI**: OpenAI GPT-4
- **Validation**: Zod
- **Actions**: Server Actions with next-safe-action
