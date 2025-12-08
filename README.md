# CluckHub: Modern Poultry Farm Management

CluckHub is a comprehensive, AI-powered platform designed to help poultry farmers manage their operations with modern tools and data-driven insights. From tracking flock health to optimizing feed and analyzing financial performance, CluckHub provides a centralized dashboard for all your farm management needs.

## ✨ Features

*   **Interactive Dashboard:** Get an at-a-glance overview of your farm's key metrics, including average flock weight, feed conversion ratio, and total flock size.
*   **Flock Inventory Management:** Easily track all your active flocks. Add new chicks, record losses, and update key data like average weight and feed consumption.
*   **Financial Tracking:** Log all sales and expenditures to maintain a clear view of your farm's financial health.
*   **Financial Reports:** Visualize your revenue, expenditures, and net profit over time with interactive charts.
*   **Performance Analytics:** Deep dive into performance with detailed reports on mortality rate, Feed Conversion Ratio (FCR), and average weight. Filter data per-flock or view overall farm performance.
*   **AI-Powered Insights:**
    *   **Feed Optimizer:** Uses Genkit to recommend the optimal feed mix for cost-efficiency and growth.
    *   **Health Predictor:** Analyzes historical and real-time data to forecast potential health issues.
    *   **Poultry Q&A:** An AI expert you can ask any question about poultry management.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models
*   **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
*   **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🚀 Getting Started

To get this project up and running on your local machine, follow these steps.

### 1. Prerequisites

Make sure you have Node.js (v18 or later) and npm installed.

### 2. Install Dependencies

In your project directory, run the following command to install all the necessary packages:

```bash
npm install
```

### 3. Firebase Setup

This project is configured to work with Firebase.

1.  The necessary Firebase configuration is already present in `src/firebase/config.ts`.
2.  The application uses Firestore as its database. The security rules in `firestore.rules` are set up to ensure that users can only access their own data.
3.  Firebase Authentication is used for user management.

### 4. Set up Environment Variables

You will need a Google AI API key to use the Genkit features. Create a `.env.local` file in the root of your project and add your key:

```
GEMINI_API_KEY=your_google_ai_api_key_here
```

### 5. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

This will start the Next.js application on `http://localhost:9002`.

### 6. Run the Genkit Developer UI

To interact with the AI flows and prompts in a development environment, run the Genkit developer UI in a separate terminal:

```bash
npm run genkit:watch
```

This will start the Genkit UI, typically on `http://localhost:4000`.
