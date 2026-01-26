# Deployment Guide

This app is built with **React + Vite**. It is a static site (SPA) and can be deployed easily to platforms like Vercel or Netlify.

## Option 1: Deploy to Vercel (Recommended)

1.  Create a [Vercel account](https://vercel.com/).
2.  Install Vercel CLI (optional) or just use the web dashboard.
3.  **Web Dashboard Method**:
    *   Push your code to GitHub.
    *   Import the repository in Vercel.
    *   Vercel will automatically detect Vite.
    *   Click **Deploy**.

4.  **CLI Method**:
    *   Run `npx vercel` in this folder.
    *   Follow the prompts (Say "Yes" to everything).

## Option 2: Deploy to Netlify

1.  Create a [Netlify account](https://netlify.com/).
2.  Drag and drop the `dist` folder (after running `npm run build`) to the Netlify dashboard.
3.  **OR** Connect to GitHub for continuous deployment.
    *   Build command: `npm run build`
    *   Publish directory: `dist`

## Important Note on Data

This app uses **LocalStorage** to store data in the browser.
*   Data is **NOT** shared between devices.
*   If you clear your browser cache, you lose the data.
*   **Use the "Settings -> Export Data" feature regularly to backup your data.**
