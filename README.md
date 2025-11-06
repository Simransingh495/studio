# BloodSync - A Firebase Studio Project

This is a Next.js starter project created in Firebase Studio. It's an AI-powered platform designed to connect blood donors with patients in need, featuring real-time data, user authentication, and smart matching capabilities.

## Running the Project Locally

To run this application on your local machine using Visual Studio Code, follow these steps:

### 1. Install Dependencies

First, open the integrated terminal in VS Code (you can use the shortcut `Ctrl+\`` or `Cmd+\``) and run the following command to install all the required project packages:

```bash
npm install
```

### 2. Run the Web Application

Once the packages are installed, start the Next.js development server. This will run the main front-end and user interface of your application.

```bash
npm run dev
```

After this command finishes, your application will be running and accessible at `http://localhost:9002`.

### 3. Run the AI Backend (for AI Features)

This project uses **Genkit** to power its AI features, like the "Smart Match" functionality. To enable these features, you need to run the Genkit development server in a separate terminal.

Open a **new terminal** in VS Code and run the following command:

```bash
npm run genkit:dev
```

With both the Next.js and Genkit servers running, all features of your application will be available for you to test and develop locally.
