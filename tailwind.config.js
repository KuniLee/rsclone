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
        },
        fontFamily: {
            HelveticaNeueCyr: ['HelveticaNeueCyr', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            Arial: ['Arial', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        },
    },
    plugins: [],
}
