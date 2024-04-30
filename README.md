# Cailloux 🪨🪨🪨

## Table of contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [Quickstart](#quickstart)
- [Development](#development)
- [Deployment](#deployment)
- [Debugging](#debugging)
- [Tools](#tools)
- [Stack documentation](#stack-documentation)

## Stack

### Development Environment and Tools

- [Turborepo](https://turbo.build/repo/) - Monorepo build system & codegen
- [Bun](https://bun.sh/) – Fast npm-compatible package manager
- [Github actions](https://docs.github.com/en/actions) - Lint, Build & Apply your database migrations
- [Biome](https://biomejs.dev/) - Lint & Format
- [T3-env](https://github.com/t3-oss/t3-env) - Manage your environment variables

### Backend and Database

- [Next.js](https://nextjs.org/) – Fullstack Framework
- [Supabase](https://supabase.com) – Database Provider
- [Prisma](https://prisma.com) – ORM
- [Lucia](https://lucia-auth.com/) – Auth

### Frontend Frameworks and Libraries

- [React Hook Form](https://react-hook-form.com/) – Form Validation
- [next-themes](https://github.com/pacocoursey/next-themes) – Dark mode support
- [Tailwind](https://tailwindcss.com/) - CSS Framework
- [shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Ladle](https://ladle.dev/) - Tool for developing React components
- [TypeScript](https://www.typescriptlang.org/) – Language

### API and Validation

- [tRPC](https://trpc.io/) - End-to-end typesafety API Layer
- [Zod](https://zod.dev/) - Schema validation library

### Email and Logging

- [React Email](https://react.email/) - Email Templates
- [Resend](https://resend.com) – Transactional emails
- [Pino](https://github.com/pinojs/pino) – Logger

## Project structure

```bash
.
├── .github/                    # Github workflows
├── .vscode/                    # VSCode recommended plugins & config
├── apps/                       # The magic happens here
│   └── web/                    # Next.js app
├── packages/
│   ├── db/                     # Datamodel & migrations with Prisma
│   ├── emails/                 # Emails with react-email
│   ├── tailwind/               # Shared tailwind configuration
│   ├── tsconfig/               # Shared tsconfig
│   └── ui/                     # React component library with Ladle
├── turbo                       # turbo generators
├── .editorconfig               # editorconfig
├── .gitignore                  # gitignore
├── .nvmrc                      # nvm config
├── biome.json                  # biome linter & formatter config
├── bun.lockb                   # bun lockfile
├── commitlint.config.ts        # commitlint config
├── docker-compose.yml          # docker-compose
├── package.json                # build scripts and dependencies
├── README.md                   # This file ;)
├── tsconfig.json               # ~root tsconfig
└── turbo.json                  # Turborepo config
```

<!-- TODO: Add subproject structure for apps/web -->

## Quickstart

To get a local copy up and running, please follow these simple steps:

### Prerequisites

Here is what you need to be able to run the application:

- [Bun](https://bun.sh/docs/installation)
- [Node.js >=20.x](https://nodejs.org/en/) (Or LTS)
- [Node Version Manager (fnm)](https://github.com/Schniz/fnm)
- [Docker](https://www.docker.com/)

### Install dependencies

```bash
bun install
```

### Set up database & environment variables

Prior to starting the application locally, run the `init-setup.sh` script, it will:

- Create a docker container for your local Postgres database
- Copy the .env.example files in `apps/web` & `packages/db`.
- Apply existing datamodel migrations, seed & generate the prisma client.

```sh
sh ./init-setup.sh
```

### Set up your .env files

- Use `openssl rand -hex 32` to generate a key and add it under `ARGON_SECRET` in the `apps/web/.env` file.

Configure the rest of the environment variables for the following:

- `RESEND_API_KEY`

<!-- TODO: Add docs on how to get these keys -->

### Run the dev server

You can start the app using this command:

```bash
bun run dev
```

## Development

### Commands

```sh
# serve the application
bun run  dev

# migrate the database
bun run db:migrate

# seed the database
bun run db:seed

# run all tests
bun run test
```

## Deployment

### Vercel

Easily deploy your Next.js app with <a href="https://vercel.com/">Vercel</a> by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gomah/cailloux)

## Debugging

Debug & tracing are active by default on dev environments.

Debugging the Docker instance:

```bash
# List your containers
docker ps

# Check log for a specific container
docker logs -f e339bca6290c
```

## Tools

Install recommended extensions for vscode, see `.vscode/extensions.json`

## Scripts overview

The following scripts are available in the `package.json`:

- `build`: Build the packages & applications in the monorepo
- `dev`: Run development server
- `db:generate`: Generate the Prisma client
- `lint`: Lint accross apps & packages
- `format`: Checks & fix formatting issues
- `generate`: Turbo gen CLI
- `generate:component`: Bootstrap a new component under `packages/ui`
- `generate:package`: Bootstrap a new package under `packages/`
- `update-deps`: Check dependencies in the monorepo
- `test`: Run all tests

## Stack documentation

### tRPC

- [Concepts](https://trpc.io/docs/concepts)
- [Response Caching](https://trpc.io/docs/server/caching)

### Prisma

- [Prisma Docs](https://www.prisma.io/docs)
- [Concepts](https://www.prisma.io/docs/concepts)

### Language

- [Mozilla JavaScript References](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Typescript Docs](https://www.typescriptlang.org/docs/)

### React/ Next.js

- [Next.js](https://nextjs.org/)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

### UI

- [Tailwind CSS](https://tailwindcss.com/)
- [Ladle](https://ladle.dev/)
- [ShadCN](https://ui.shadcn.com/)

### Turborepo

- [Environment Variable Inputs](https://turbo.build/repo/docs/core-concepts/caching/environment-variable-inputs)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [Task Dependencies](https://turbo.build/repo/docs/core-concepts/monorepos/task-dependencies)
