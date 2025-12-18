# turnset-clean

**Live Site:** [turnset-clean.vercel.app](https://turnset-clean.vercel.app)

A high-performance Next.js storefront for TurnSet Clean, integrating Shopify products and Sanity CMS, built and deployed on Vercel.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0.9 (or higher) (required by Next.js 16)
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/wallacepreston/turnset-clean.git
   cd turnset-clean
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the `.env.example` file and create a `.env.local` file in the root directory.

   ```bash
   cp .env.example .env.local
   ```

   > **Note:** Contact a team developer to obtain the required environment variable values.

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Seed Data

> **Note:** This is not necessary for development, as we are using the Shopify Admin API data in development also, so the data already exists.  This is only needed to re-seed the data if we want to change something or start fresh.

- `pnpm seed:products` - This will call the Shopify Admin API to create products from seed data in [seed/products.json](seed/products.json) (requires [Shopify Admin API](https://shopify.dev/docs/api/admin) access via the `SHOPIFY_ADMIN_API_TOKEN` environment variable)

## 🛠️ Technologies

### Core Framework

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode support

### E-commerce & CMS

- **[Shopify Storefront API](https://shopify.dev/docs/api/storefront)** - Product data and cart management
- **[Sanity CMS](https://www.sanity.io/)** - Content management
- **[@sanity/client](https://www.sanity.io/docs/js-client)** - Sanity client library
- **[next-sanity](https://github.com/sanity-io/next-sanity)** - Sanity integration for Next.js
- **[@portabletext/react](https://github.com/portabletext/react-portabletext)** - Portable Text rendering (Sanity). For rendering the Sanity-formatted content in the static pages.

### UI Components

- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[class-variance-authority](https://github.com/joe-bell/cva)** - Component variant management

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Jest](https://jestjs.io/)** - Testing framework
- **[Testing Library](https://testing-library.com/)** - React component testing
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Zod](https://zod.dev/)** - Schema validation

### Deployment

- **[Vercel](https://vercel.com/)** - Hosting and deployment platform

## 📁 Project Structure

```text
turnset-clean/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── products/          # Product listing and detail pages
│   └── ...
├── components/             # React components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions and clients
│   ├── shopify.ts         # Shopify Storefront API client
│   ├── sanity.ts          # Sanity CMS client
│   └── ...
├── sanity/                # Sanity Studio configuration
│   └── schemaTypes/       # Sanity content schemas
└── seed/                  # Seed data for development
```

## 🔒 Environment Variables

All environment variables should be set in `.env.local` for local development. For production, configure them in your Vercel project settings.

**Required:**

- `SHOPIFY_STOREFRONT_API_URL` - Your Shopify Storefront API endpoint
- `SHOPIFY_STOREFRONT_API_TOKEN` - Your Shopify Storefront API access token
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID

**Optional:**

- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset name (defaults to "production")
- `SANITY_API_TOKEN` - Sanity API token (for draft/preview content)
- `NEXT_PUBLIC_SANITY_API_VERSION` - Sanity API version (defaults to "2025-12-09")

## 🚢 Deployment

This project is automatically deployed on [Vercel](https://vercel.com/) from the `main` branch. Preview deployments are created for pull requests.

- **Production:** [turnset-clean.vercel.app](https://turnset-clean.vercel.app)
- **Repository:** [GitHub](https://github.com/wallacepreston/turnset-clean)

## 📝 License

Private project - All rights reserved.
