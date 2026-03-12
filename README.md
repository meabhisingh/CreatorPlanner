# YouTube Creator Management Platform

A comprehensive, all-in-one console designed for YouTube creators to manage their entire video production workflow, from initial idea generation to post-production scheduling. Built with Next.js, Prisma, and TailwindCSS.

## Features

- **🎬 Video Pipeline (Kanban):** Track video projects across different stages (Idea, Research, Script, Recording, Editing, Scheduled, Published) via a rich drag-and-drop interface.
- **💡 Idea Vault:** A dedicated space to quickly jot down and organize potential video concepts.
- **🤖 AI Strategist:** Generate structured video ideas (Title, Description, Thumbnail Concept) instantly using OpenAI, tailored to your channel's niche and target audience.
- **📚 Series Management:** Group related videos into overarching series to track collective production progress dynamically.
- **📑 Reusable Templates:** Create and manage structural video frameworks to accelerate the scripting process.
- **📊 Dynamic Dashboard:** Get a real-time overview of your production stats, upcoming deadlines, and scheduled uploads at a glance.
- **⚙️ Advanced Settings:** Configure channel defaults, manage notification preferences, and handle account deletion.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (via Neon)
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** better-auth
- **AI Integration:** OpenAI API
- **Storage:** AWS S3 (or S3-compatible alternatives like Cloudflare R2)

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL Database string (e.g., via Neon, Vercel Postgres, or local)
- OpenAI API Key (for the AI Strategist functionality)
- S3 Bucket credentials (for thumbnail/asset uploads)

### Installation

1.  **Clone the repository** (if applicable):

    ```bash
    git clone https://github.com/yourusername/youtube-management.git
    cd youtube-management
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and populate it based on the expected variables (Database URL, Auth secrets, OpenAI Key, S3 credentials, etc.). See the codebase for exact variable names required.

4.  **Database Setup:**
    Push the Prisma schema to your database:

    ```bash
    npx prisma db push
    # or
    npx prisma migrate dev
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
