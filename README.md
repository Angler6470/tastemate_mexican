# TasteMate - AI-Powered Food Recommendation App

🌮 **Your Smart Food Companion** - Get personalized Mexican food recommendations based on your taste preferences!

## What is TasteMate?

TasteMate is a smart web application that helps you discover the perfect Mexican dishes based on your personal preferences. Simply tell the app what you're craving, how spicy you like your food, and your favorite flavors - and our AI will recommend the best dishes for you!

## Key Features

### 🤖 **AI-Powered Recommendations**
- Chat with our smart assistant to get personalized food suggestions
- AI analyzes your preferences and recommends dishes that match your taste
- Powered by OpenAI's advanced language models

### 🌶️ **Spice Level Control**
- Easy-to-use slider to set your preferred spice level (1-10)
- Get recommendations that match your heat tolerance
- Perfect for both spice lovers and those who prefer milder flavors

### 🎯 **Flavor Selection**
- Choose from various flavor categories (spicy, sweet, savory, etc.)
- Mix and match flavors to find your perfect combination
- Quick-select buttons for easy flavor picking

### 🎲 **Surprise Me Feature**
- Feeling adventurous? Let the AI surprise you with random recommendations
- Discover new dishes you might never have tried otherwise
- Perfect for expanding your culinary horizons

### 🌍 **Multi-Language Support**
- Available in English and Spanish
- Switch languages instantly with the flag buttons
- All content is properly translated for both languages

### 🎨 **Beautiful Design**
- Modern, responsive design that works on all devices
- Multiple theme options (Ocean, Forest, Sunset, etc.)
- Dark and light mode support
- Smooth animations and transitions

### 📱 **Mobile-Friendly**
- Works perfectly on phones, tablets, and computers
- Touch-friendly interface
- Responsive layout that adapts to any screen size

## How to Use TasteMate

### 1. **Set Your Preferences**
   - Use the spice slider to set how spicy you want your food (1 = mild, 10 = very hot)
   - Click on flavor buttons to select your favorite taste profiles
   - You can select multiple flavors at once

### 2. **Chat with the AI**
   - Type your food cravings in the chat box
   - Tell the AI what you're in the mood for (e.g., "I want something cheesy and filling")
   - The AI will consider your spice level and flavor preferences

### 3. **Get Recommendations**
   - The AI will suggest specific dishes from our Mexican menu
   - Each recommendation includes the dish name and description
   - Recommendations are personalized to your exact preferences

### 4. **Try the Surprise Feature**
   - Click "Surprise Me" if you want the AI to pick something random
   - Great for discovering new dishes you might love
   - Based on your current preferences but with an element of surprise

## Technical Details

### What's Under the Hood?
- **Frontend**: Built with React and TypeScript for a smooth user experience
- **Backend**: Node.js server with Express framework
- **Database**: PostgreSQL for storing menu items, user preferences, and app data
- **AI Integration**: OpenAI API for intelligent food recommendations
- **Styling**: Tailwind CSS for beautiful, responsive design

### Architecture
- **Client-Server**: Separate frontend and backend for better performance
- **Real-time Updates**: Live chat interface with instant AI responses
- **Secure**: JWT-based authentication for admin features
- **Scalable**: Designed to handle multiple users and can be themed for different restaurants

## Admin Features

### 📊 **Content Management**
- Add, edit, and delete menu items
- Manage flavor categories and spice levels
- Update promotional content and themes
- Review and approve user feedback

### 🔧 **Customization**
- Change app themes and colors
- Add custom promotional banners
- Configure keyboard shortcuts
- Manage app-wide settings

### 📈 **Analytics**
- View user interactions and preferences
- Track popular dishes and flavors
- Monitor AI recommendation success rates
- Review user feedback and ratings

## For Restaurant Owners

TasteMate is designed to be easily customized for different restaurants:

### 🏪 **Multi-Restaurant Ready**
- Easy to rebrand with your restaurant's logo and colors
- Customizable menu items and categories
- Flexible theming system
- Works for any type of cuisine (currently optimized for Mexican food)

### 💼 **Business Benefits**
- Increase customer engagement with interactive recommendations
- Help customers discover new menu items
- Reduce decision fatigue with personalized suggestions
- Modern, professional web presence

## Getting Started (For Developers)

### Prerequisites
- Node.js (version 16 or higher)
- PostgreSQL database
- OpenAI API key

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd tastemate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your database URL and OpenAI API key
   - See `.env.example` for reference

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in your browser**
   - Go to `http://localhost:5000`
   - The app will automatically reload when you make changes

### Project Structure
```
tastemate/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main app pages
│   │   └── contexts/    # React contexts for state management
├── server/              # Backend Node.js server
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── services/        # External service integrations
├── shared/              # Code shared between frontend and backend
│   └── schema.ts        # Database schema and types
└── README.md           # This file
```

## Customization Guide

### Adding New Menu Items
1. Log into the admin panel (`/admin`)
2. Go to the "Menu Items" tab
3. Click "Add New Item"
4. Fill in the dish name, description, and details
5. Save your changes

### Changing Themes
1. Access the admin panel
2. Navigate to "Themes" section
3. Modify existing themes or create new ones
4. Users can select themes from the header dropdown

### Adding New Languages
1. Update the language files in `client/src/contexts/LanguageContext.tsx`
2. Add translations for all text content
3. Update the language selector in the header

## Support and Feedback

### Getting Help
- Check the admin panel for configuration options
- Review the app logs for any error messages
- Ensure all environment variables are properly set

### Reporting Issues
- Document any bugs or unexpected behavior
- Include steps to reproduce the issue
- Note your browser and device information

### Feature Requests
- Suggest new features or improvements
- Provide use cases for how the feature would be helpful
- Consider how it would benefit both users and restaurant owners

## License and Usage

This application is designed for restaurant use and can be customized for different establishments. The AI-powered recommendation system makes it perfect for enhancing customer experience and helping people discover new dishes they'll love.

---

**TasteMate** - Making food discovery delicious and easy! 🌮✨