/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}", // এই লাইনটি আপনার সাব-ফোল্ডারের ফাইলগুলো ডিটেক্ট করবে
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3ec1d3",
        darkBlue: "#0e2a47",
      },
      // যদি স্ক্রিন সাইজ নিয়ে সমস্যা থাকে তবে আপনি কাস্টম ব্রেকপয়েন্ট এখানে যোগ করতে পারেন
      screens: {
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}
























