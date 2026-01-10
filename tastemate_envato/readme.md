# TasteMate Mexican

A shortcut-driven food decision engine for Mexican cuisine.

## Features
- Category-based filtering (Meal, Dessert, Drink).
- Bouncy, colorful shortcut buttons for quick decisions.
- Ingredient exclusion system (Dietary & Ingredients).
- Admin section for configuration and menu editing.
- **Node.js/Express Backend**: Changes are persisted directly to JSON files.

## Admin Access
To access the admin section:
1. Click the **TasteMate Logo** at the top of the page **5 times quickly**.
2. Enter the admin password when prompted (Default: `tastemate`).
3. Use the Admin Panel to change design settings, text, layout, and the menu via JSON.

## Local Development
1. Install dependencies: `npm install`
2. Create a `.env` file (you can copy `.env.example`) and set `ADMIN_SECRET_KEY=your-secret-key`
3. Start the server: `npm start`
4. Open `http://localhost:3000` in your browser.

## 📦 Envato Setup (Fast Track)
If you've just purchased this script, follow these 3 steps:
1. **Host it**: Upload the files to any Node.js compatible host (Render, DigitalOcean, etc.).
2. **Configure**: Rename `.env.example` to `.env` and set your `ADMIN_SECRET_KEY`. **Admin saving will not work until this is set.**
3. **Launch**: Run `npm start` and your restaurant's decision engine is live!

### 🔑 Security & Admin Access:
- **Protection**: All admin save requests are protected by the `ADMIN_SECRET_KEY` set in your `.env` file.
- **Setup**: You **must** set this value in your environment for the "Save Changes" feature to work.
- **Demo Mode**: The app will still load and function in "read-only" mode even if `.env` is missing, allowing for easy demos.

## Deployment (VPS / Render / DigitalOcean)
This project is designed for deployment on servers with persistent disks.

### 🌟 Recommended Platforms:
- **Render**: Use a "Web Service" and attach a **Persistent Disk** to the `/public` folder to ensure your JSON changes are never lost.
- **DigitalOcean / Linode / AWS**: Deploy as a standard Node.js app. The `fs.writeFileSync` logic will permanently update your JSON files on the server's disk.

### 🔑 Environment Variables:
Set these in your hosting provider's dashboard:
- `ADMIN_SECRET_KEY`: The key used to authorize frontend save requests (matches `script.js`).
- `PORT`: Default is 3000.

## Backend API
- `GET /api/config`: Fetch current configuration.
- `POST /api/config`: Save configuration (requires `admin-key` header).
- `GET /api/menu`: Fetch current menu.
- `POST /api/menu`: Save menu (requires `admin-key` header).

## Technologies
- Node.js & Express.
- Vanilla HTML/CSS/JS.
- JSON-based data storage.
- `.env` for secure configuration.
