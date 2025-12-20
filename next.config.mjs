import withPWA from 'next-pwa';
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode : true,






};
const pwaConfig = withPWA({
  dest: "public", // Destination directory for the PWA files
  //disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
  register: true, // Register the PWA service worker
  skipWaiting: true, // Skip waiting for service worker activation
});


export default pwaConfig(nextConfig);
