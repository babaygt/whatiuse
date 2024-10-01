# What I Use

## About

"What I Use" is a modern web application that allows users to showcase the tools, apps, and gear that power their workflow. Connect with others, discover new resources, and share your setup with the world.

## Features

- **User Profiles**: Create and customize your personal profile
- **Category Management**: Organize your items into custom categories
- **OAuth Integration**: Sign up and log in with GitHub and Google
- **Responsive Design**: Fully responsive layout for all devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Lucia Auth
- **File Upload**: UploadThing
- **Form Handling**: React Hook Form, Zod validation
- **Email Service**: Resend

## Getting Started

Follow these steps to get the project up and running locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/babaygt/whatiuse.git
   cd what-i-use
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Duplicate the `.env.example` file and rename it `.env`.
   - Fill in the necessary variables such as database credentials, OAuth keys, etc.

   ```bash
   cp .env.example .env
   ```

4. **Database setup:**

   - Make sure PostgreSQL is running and configure the connection in the `.env` file.
   - Run the migrations to set up the database schema:

   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Ensure the following environment variables are set in your `.env` file:

```bash
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_BASE_URL=your_project_url
RESEND_API_KEY=your_resend_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
UPLOADTHING_TOKEN=your_uploadthing_token
```

## Usage

1. **User Registration & Authentication**: Sign up using OAuth (GitHub or Google) or manually create an account.
2. **Profile Customization**: Add tools, apps, and gear you use and organize them into categories.
3. **Sharing**: Share your setup with others, discover what tools they use, and explore new workflows to enhance your productivity.
4. **Dark Mode**: Switch between dark and light mode for a better user experience.

## Contributing

Contributions are highly appreciated! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature (git checkout -b feature/new-feature).
3. Commit your changes (git commit -m 'Add new feature').
4. Push to your branch (git push origin feature/new-feature).
5. Open a pull request and provide a detailed description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
