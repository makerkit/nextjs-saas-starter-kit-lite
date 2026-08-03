![Makerkit - Next.js Supabase SaaS Starter Kit \[Lite version\]](apps/web/public/images/makerkit.webp)

# NEW! Next.js Supabase SaaS Starter Kit (Lite)

Start building your SaaS faster with our Next.js 16.3 + Supabase starter kit.

👉 **Looking for a full-featured SaaS Starter Kit?** [Check out the complete version](https://makerkit.dev)

⭐️ **Why Developers Trust Makerkit:**
- Production-grade architecture decisions
- Comprehensive TypeScript setup
- Modern stack: Next.js 15, Supabase, TailwindCSS v4
- Quality Code tooling: ESLint v9, Prettier, strict TypeScript, etc.
- Regular updates and active maintenance

PS: the documentation for this kit is still being updated, so please check back later for more details.

## What's Included

### Core Architecture
- 🏗️ Next.js 16.3 + Turborepo monorepo setup
- 🎨 Shadcn UI (Base UI) components with TailwindCSS v4
- 🔐 Supabase authentication & basic DB
- 🌐 i18n translations (client + server)
- ✨ Full TypeScript 7 + Oxlint + Oxfmt configuration

### Key Features
- 👤 User authentication flow
- ⚙️ User profile & settings
- 📱 Responsive marketing pages
- 🔒 Protected routes
- 🎯 Basic test setup with Playwright

### Technologies

This starter kit provides core foundations:

🛠️ **Technology Stack**:
- [Next.js 16.3](https://nextjs.org/): A React-based framework for server-side rendering and static site generation.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapidly building custom designs.
- [Supabase](https://supabase.com/): A realtime database for web and mobile applications.
- [Turborepo](https://turborepo.org/): A monorepo tool for managing multiple packages and applications.
- [Shadcn UI](https://shadcn.com/): A collection of components built using Tailwind CSS.
- [Zod](https://github.com/colinhacks/zod): A TypeScript-first schema validation library.
- [React Query](https://tanstack.com/query/v4): A powerful data fetching and caching library for React.
- [Playwright](https://playwright.dev/): A framework for end-to-end testing of web applications.

This kit is a trimmed down version of the [full version of this SaaS Starter Kit](https://makerkit.dev). It is a good way to evaluate small part of the full kit, or to simply use it as a base for your own project.

## Comparing Lite vs Full Version

The lite kit is perfect for:
- Evaluating our code architecture and patterns
- Building basic SaaS prototypes
- Learning our tech stack approach
- Building a basic SaaS tool

The [full version](https://makerkit.dev) adds production features:
- 💳 Complete billing and subscription system
- 👥 Team accounts and management
- 📧 Mailers and Email Templates (Nodemailer, Resend, etc.)
- 📊 Analytics (GA, Posthog, Umami, etc.)
- 🔦 Monitoring providers (Sentry, Baselime, etc.)
- 🔐 Production database schema
- ✅ Comprehensive test suite
- 🔔 Realtime Notifications
- 📝 Blogging system
- 💡 Documentation system
- ‍💻 Super Admin panel
- 🕒 Daily updates and improvements
- 🐛 Priority bug fixes
- 🤝 Support
- ⭐️ Used by 1000+ developers
- 💪 Active community members
- 🏢 Powers startups to enterprises

[View complete feature comparison →](https://makerkit.dev/#pricing)

## Getting Started

### Prerequisites

- Node.js 18.x or later (preferably the latest LTS version)
- Docker
- PNPM

Please make sure you have a Docker daemon running on your machine. This is required for the Supabase CLI to work.

### Installation

#### 1. Clone this repository

```bash
git clone https://github.com/makerkit/next-supabase-saas-kit-lite.git
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Start Supabase

Please make sure you have a Docker daemon running on your machine.

Then run the following command to start Supabase:

```bash
pnpm run supabase:web:start
```

Once the Supabase server is running, please access the Supabase Dashboard using the port in the output of the previous command. Normally, you find it at [http://localhost:54323](http://localhost:54323).

You will also find all the Supabase services printed in the terminal after the command is executed.

##### Stopping Supabase

To stop the Supabase server, run the following command:

```bash
pnpm run supabase:web:stop
```

##### Resetting Supabase

To reset the Supabase server, run the following command:

```bash
pnpm run supabase:web:reset
```

##### More Supabase Commands

For more Supabase commands, see the [Supabase CLI documentation](https://supabase.com/docs/guides/cli).

```
# Create new migration
pnpm --filter web supabase migration new <name>

# Link to Supabase project
pnpm --filter web supabase link

# Push migrations
pnpm --filter web supabase db push
```

#### 4. Start the Next.js application

```bash
pnpm run dev
```

The application will be available at http://localhost:3000.

#### 5. Code Health (linting, formatting, etc.)

To format your code, run the following command:

```bash
pnpm run format:fix
```

To lint your code, run the following command:

```bash
pnpm run lint
```

To validate your TypeScript code, run the following command:

```bash
pnpm run typecheck
```

Turborepo will cache the results of these commands, so you can run them as many times as you want without any performance impact.

## Project Structure

The project is organized into the following folders:

```
apps/
├── web/                  # Next.js application
│   ├── app/             # App Router pages
│   │   ├── (marketing)/ # Public marketing pages
│   │   ├── auth/        # Authentication pages
│   │   └── home/        # Protected app pages
│   ├── supabase/        # Database & migrations
│   └── config/          # App configuration
│
packages/
├── ui/                  # Shared UI components
└── features/           # Core feature packages
    ├── auth/           # Authentication logic
    └── ...
```

For more information about this project structure, see the article [Next.js App Router: Project Structure](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure).

### Environment Variables

You can configure the application by setting environment variables in the `.env.local` file.

Here are the available variables:

| Variable Name | Description | Default Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The URL of your SaaS application | `http://localhost:3000` |
| `NEXT_PUBLIC_PRODUCT_NAME` | The name of your SaaS product | `Makerkit` |
| `NEXT_PUBLIC_SITE_TITLE` | The title of your SaaS product | `Makerkit - The easiest way to build and manage your SaaS` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | The description of your SaaS product | `Makerkit is the easiest way to build and manage your SaaS. It provides you with the tools you need to build your SaaS, without the hassle of building it from scratch.` |
| `NEXT_PUBLIC_DEFAULT_THEME_MODE` | The default theme mode of your SaaS product | `light` |
| `NEXT_PUBLIC_THEME_COLOR` | The default theme color of your SaaS product | `#ffffff` |
| `NEXT_PUBLIC_THEME_COLOR_DARK` | The default theme color of your SaaS product in dark mode | `#0a0a0a` |
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anon key of your Supabase project | ''
| `SUPABASE_SERVICE_ROLE_KEY` | The service role key of your Supabase project | ''

## Architecture

This starter kit uses a monorepo architecture.

1. The `apps/web` directory is the Next.js application.
2. The `packages` directory contains all the packages used by the application.
3. The `packages/features` directory contains all the features of the application.
4. The `packages/ui` directory contains all the UI components.

For more information about the architecture, please refer to the [Makerkit blog post about Next.js Project Structure](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure).

### Marketing Pages

Marketing pages are located in the `apps/web/app/(marketing)` directory. These pages are used to showcase the features of the SaaS and provide information about the product.

### Authentication

Authenticated is backed by Supabase. The `apps/web/app/auth` directory contains the authentication pages, however, the logic is into its own package `@kit/auth` located in `packages/features/auth`.

This package can be used across multiple applications.

### Gated Pages

Gated pages are located in the `apps/web/app/home` directory. Here is where you can build your SaaS pages that are gated by authentication.

### Database

The Supabase database is located in the `apps/web/supabase` directory. In this directory you will find the database schema, migrations, and seed data.

#### Creating a new migration
To create a new migration, run the following command:

```bash
pnpm --filter web supabase migration new --name <migration-name>
```

This command will create a new migration file in the `apps/web/supabase/migrations` directory. 

#### Applying a migration

Once you have created a migration, you can apply it to the database by running the following command:

```bash
pnpm run supabase:web:reset
```

This command will apply the migration to the database and update the schema. It will also reset the database using the provided seed data.

#### Linking the Supabase database

Linking the local Supabase database to the Supabase project is done by running the following command:

```bash
pnpm --filter web supabase db link
```

This command will link the local Supabase database to the Supabase project.

#### Pushing the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project. You can now apply the migration to the Supabase database.

## Going to Production

#### 1. Create a Supabase project

To deploy your application to production, you will need to create a Supabase project.

#### 2. Push the migration to the Supabase project

After you have made changes to the migration, you can push the migration to the Supabase project by running the following command:

```bash
pnpm --filter web supabase db push
```

This command will push the migration to the Supabase project.

#### 3. Set the Supabase Callback URL

When working with a remote Supabase project, you will need to set the Supabase Callback URL.

Please set the callback URL in the Supabase project settings to the following URL:

`<url>/auth/callback`

Where `<url>` is the URL of your application.

#### 4. Deploy to Vercel or any other hosting provider

You can deploy your application to any hosting provider that supports Next.js.

#### 5. Deploy to Cloudflare

The configuration should work as is, but you need to set the runtime to `edge` in the root layout file (`apps/web/app/layout.tsx`).

```tsx
export const runtime = 'edge';
```

Remember to enable Node.js compatibility in the Cloudflare dashboard.

## Deployment Options

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/9r-iFh?referralCode=RmCO-Z&utm_medium=integration&utm_source=template&utm_campaign=generic)

## Contributing

Contributions for bug fixed are welcome! However, please open an issue first to discuss your ideas before making a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

No support is provided for this kit. Feel free to open an issue if you have any questions or need help, but there is no guaranteed response time, nor guarantee a fix.

For dedicated support, priority fixes, and advanced features, [check out our full version](https://makerkit.dev).
