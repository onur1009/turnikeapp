/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "primary": "#c4c5dd",
                "on-secondary-container": "#ffcccc",
                "on-error-container": "#ffdad6",
                "tertiary-fixed-dim": "#64de87",
                "error": "#ffb4ab",
                "on-primary-fixed": "#181a2c",
                "surface": "#051424",
                "primary-container": "#1a1c2e",
                "on-primary": "#2d2f42",
                "on-tertiary-container": "#04994b",
                "secondary-fixed-dim": "#ffb3b4",
                "on-tertiary": "#003918",
                "tertiary-fixed": "#81fba0",
                "tertiary": "#64de87",
                "inverse-surface": "#d4e4fa",
                "outline-variant": "#46464c",
                "on-secondary": "#680016",
                "on-background": "#d4e4fa",
                "on-secondary-fixed-variant": "#920024",
                "secondary-fixed": "#ffdad9",
                "on-error": "#690005",
                "surface-container-low": "#0d1c2d",
                "surface-container-high": "#1c2b3c",
                "surface-variant": "#273647",
                "on-primary-fixed-variant": "#444559",
                "on-tertiary-fixed": "#00210b",
                "error-container": "#93000a",
                "surface-tint": "#c4c5dd",
                "surface-container": "#122131",
                "inverse-on-surface": "#233143",
                "surface-container-highest": "#273647",
                "on-surface-variant": "#c7c5cd",
                "primary-fixed": "#e0e0fa",
                "on-primary-container": "#82849a",
                "surface-bright": "#2c3a4c",
                "on-tertiary-fixed-variant": "#005225",
                "inverse-primary": "#5b5d72",
                "primary-fixed-dim": "#c4c5dd",
                "background": "#051424",
                "outline": "#919097",
                "tertiary-container": "#00230c",
                "surface-dim": "#051424",
                "secondary-container": "#bf0031",
                "surface-container-lowest": "#010f1f",
                "secondary": "#ffb3b4",
                "on-secondary-fixed": "#40000a",
                "on-surface": "#d4e4fa",
                "metro-red": "#ec1c24",
                "vapur-blue": "#3b82f6",
                "terminal-green": "#22c55e",
                "metrobus-orange": "#f97316"
            },
            "spacing": {
                "margin-mobile": "16px",
                "base": "8px",
                "max-width": "1280px",
                "margin-desktop": "32px",
                "gutter": "16px"
            },
            "borderRadius": {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
            "fontFamily": {
                "body-md": ["Inter", "sans-serif"],
                "label-caps": ["JetBrains Mono", "monospace"],
                "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
                "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
                "transit-id": ["Plus Jakarta Sans", "sans-serif"],
                "body-sm": ["Inter", "sans-serif"],
                "headline-xl": ["Plus Jakarta Sans", "sans-serif"]
            },
            "fontSize": {
                "headline-xl": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
                "transit-id": ["18px", {"lineHeight": "18px", "fontWeight": "700"}]
            }
        }
    },
    plugins: [],
}
