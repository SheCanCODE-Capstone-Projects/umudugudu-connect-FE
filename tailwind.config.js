/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: {
    primary: { 50:'#E8F5E9',100:'#C8E6C9',500:'#4CAF50',600:'#43A047',700:'#388E3C',900:'#1B5E20' },
    gov: { green:'#2E7D32', gold:'#F9A825', dark:'#1A1A2E' }
  } } },
  plugins: []
};
