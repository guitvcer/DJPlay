module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        monoton: ['Monoton'],
        raleway: ['Raleway']
      },
      colors: {
        main: {
          light: '#929aab',
          DEFAULT: '#393e46',
          dark: '#2d333b',
          dark2: '#22272e',
        },
        friend: {
          add: '#74cf74',
          remove: '#e37878'
        }
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
