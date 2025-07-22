# CreatorPulse Frontend

AI-powered LinkedIn content generator that transforms hours of content ideation into minutes of review time.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **UI Components**: Headless UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.local` and update with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=CreatorPulse
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ui/            # Reusable UI components
└── lib/               # Utility functions and configurations
    ├── supabase.ts    # Supabase client
    ├── types.ts       # TypeScript type definitions
    └── utils.ts       # Utility functions
```

## Features

- **Modern Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Authentication Ready**: Supabase Auth integration
- **Type Safety**: Full TypeScript support with strict mode
- **Code Quality**: ESLint and Prettier configured
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Optimized with Next.js App Router and Turbopack

## Development Guidelines

- Use TypeScript for all new files
- Follow the established folder structure
- Run `npm run format` before committing
- Ensure `npm run lint` passes without errors
- Use the provided utility functions and types
