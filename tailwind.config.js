/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,hbs,js,ts}'],
    theme: {
        extend: {
            container: {
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                },
            },
            colors: {
                'color-logo': '#303b44',
                'color-border-light': '#dbdbdb',
                'color-border-dark': '#acb8bf',
                'color-border-input': '#ff6e6e',
                'color-border-header': '#dedede',
                'color-light': '#ffffff',
                'color-bg-light': '#ebf1f3',
                'color-bg-dark': '#f0f0f0',
                'color-text-dark': '#333',
                'color-text-light': '#909090',
                'color-btn-hover': '#376f9a',
                'color-additional': '#558cb7',
                'color-link-hover': '#5096b1',
                'color-button': '#548eaa',
                'color-dropdown-menu-link-hover': '#76a5bb',
                'color-dropdown-menu-btn-hover': '#edf5f9',
                'color-popup-btn-hover': '#39728e',
                'color-popup-text': '#838a92',
                'color-popup-bg': 'rgba(0,0,0,.2)'
            }
        },
        fontFamily: {
            HelveticaNeueCyr: ['HelveticaNeueCyr', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            Arial: ['Arial', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        },
    },
    plugins: [],
}
