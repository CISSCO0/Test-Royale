import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Update primary colors to use cyan theme
  			primary: {
  				DEFAULT: '#22d3ee', // cyan-400
  				50: '#ecfeff',  // cyan-50
  				100: '#cffafe', // cyan-100
  				200: '#a5f3fc', // cyan-200
  				300: '#67e8f9', // cyan-300
  				400: '#22d3ee', // cyan-400
  				500: '#06b6d4', // cyan-500
  				600: '#0891b2', // cyan-600
  				700: '#0e7490', // cyan-700
  				800: '#155e75', // cyan-800
  				900: '#164e63', // cyan-900
  				950: '#083344', // cyan-950
  				foreground: '#ffffff',
  			},
  			// Update background colors for dark theme
  			background: {
  				DEFAULT: '#020617', // slate-950
  			},
  			// Update card and border colors
  			card: {
  				DEFAULT: 'rgba(15, 23, 42, 0.95)', // slate-900 with opacity
  				foreground: '#ffffff'
  			},
  			border: {
  				DEFAULT: 'rgba(34, 211, 238, 0.3)', // cyan-400 with opacity
  			},
  			ring: {
  				DEFAULT: 'rgba(34, 211, 238, 0.5)', // cyan-400 with opacity
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'float': 'float 10s ease-in-out infinite',
  			'glow': 'glow 3s ease-in-out infinite',
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-20px)' },
  			},
  			glow: {
  				'0%, 100%': { opacity: '0.3' },
  				'50%': { opacity: '0.7' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
