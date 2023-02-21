/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,hbs,js,ts}'],
    theme: {
        extend: {
            container: {
                padding: {
                    DEFAULT: '0rem',
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
                'color-button-disabled': '#929292',
                'color-popup-text': '#838a92',
                'color-overlay': 'rgba(0,0,0,.2)',
                'color-gray-light': '#eeeeee',
                'color-gray-separator': '#d3d7db',
                'color-button-send': '#7aa600',
                'color-button-send-hover': '#4c7816',
                'color-border-button-comment-form': '#d2d2d2',
                'color-text-button-comment-form': '#737d81',
                'color-comments-notice': '#71992e',
            },
        },
        fontFamily: {
            HelveticaNeueCyr: ['HelveticaNeueCyr', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            Arial: ['Arial', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        },
    },
    plugins: [
        function ({ addComponents }) {
            addComponents({
                '.container': {
                    maxWidth: '100%',
                    '@screen xl': {
                        maxWidth: '1096px',
                    },
                    '@screen 2xl': {
                        maxWidth: '1096px',
                    },
                },
            })
        },
    ],
}
