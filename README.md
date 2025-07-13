# Family Tracker

A simple Express.js application that lets family members log the countries they've visited. Built with Node.js, EJS for templating, and PostgreSQL for data storage. Easily deployable on platforms like Render.

## Features

* Add new users with custom display colors
* Log visited countries per user
* View count and list of visited countries
* Switch between users
* Clean, responsive UI with EJS and plain CSS

## Prerequisites

* Node.js (v14 or higher)
* npm or yarn
* PostgreSQL database

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/family-tracker.git
   cd family-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Environment Variables**

   Copy the example `.env.example` to `.env` and fill in your database credentials:

   ```text
   # Local development (PostgreSQL)
   PG_USER=your_db_user
   PG_HOST=localhost
   PG_DATABASE=your_db_name
   PG_PASSWORD=your_db_password
   PG_PORT=5432

   # (Optional) Render-managed database
   # DATABASE_URL=postgres://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require
   ```

## Database Setup

1. Create a new PostgreSQL database (if not using Render):

   ```bash
   createdb family_tracker
   ```

2. Run the SQL schema to create tables:

   ```sql
   -- users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     color TEXT NOT NULL
   );

   -- countries lookup
   CREATE TABLE countries (
     country_code CHAR(2) PRIMARY KEY,
     country_name TEXT NOT NULL
   );

   -- visited countries join table
   CREATE TABLE visited_countries (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     country_code CHAR(2) REFERENCES countries(country_code) ON DELETE CASCADE
   );
   ```

3. (Optional) Populate the `countries` table with ISO country codes and names. You can find CSV dumps online or use a script.

## Running Locally

```bash
npm start
```

By default, the app listens on port `3000`. Visit `http://localhost:3000` in your browser.

## Deployment on Render

1. Push your code to GitHub.
2. In the Render dashboard, create a new **Web Service** and connect your GitHub repo.
3. Set the build command to:

   ```bash
   npm install
   ```
4. Set the start command to:

   ```bash
   npm start
   ```
5. Add environment variables on Render:

   * If using Render’s PostgreSQL: only set `DATABASE_URL` to the provided connection string.
   * Otherwise, set `PG_USER`, `PG_HOST`, `PG_DATABASE`, `PG_PASSWORD`, `PG_PORT`.
6. Deploy. Your service URL will be shown once it’s live.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Developed by Samad Suara.*
