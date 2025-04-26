
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html, js}"],
    theme: {
      extend: {
        colors: {
  "druk": "#c9cfc22",
  
  "background": "#3f7072",
  // compl #4C425B
  'offblue' : '#488083',
  
  "primary": "#1b3031",
  // comp #301C1B
  "primary1": {
          '50': '#f3faf9',
          '100': '#d8efed',
          '200': '#b1deda',
          '300': '#83c5c2',
          '400': '#59a8a7',
          '500': '#3f8d8d',
          '600': '#307071',
          '700': '#2a595b',
          '800': '#25494a',
          '900': '#1b3031',
          '950': '#0f2324',
      },
  
      'contrast': {
          '50': '#fdf7ef',
          '100': '#fbecd9',
          '200': '#f6d6b2',
          '300': '#f0ba81',
          '400': '#e88f46',
          '500': '#e4772b',
          '600': '#d55f21',
          '700': '#b1481d',
          '800': '#8d3a1f',
          '900': '#72321c',
          '950': '#3d170d',
      },
      
      
  "testy" : "#8d3a1f",
  "warning" : "#8F3739",
  
  "secondary": "#2d5052",
  
  "bone" : "#F2EBE3",
  
  "accent": "#691313",
          "color-primary" : "#01051e",
          "white" : "#EEEEEE"
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '20px',
          md: '50px'
        }
      }
    },
    plugins: [],
  }