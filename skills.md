# Skill: Setup Expo + NativeWind + Supabase

Para inicializar el entorno visual y de datos en este proyecto, debes ejecutar y configurar lo siguiente:

1. **Instalar dependencias clave:**
   `npx expo install nativewind tailwindcss react-native-safe-area-context @supabase/supabase-js expo-font expo-sharing`

2. **Configurar Tailwind:**
   Ejecutar `npx tailwindcss init`.
   Configurar `tailwind.config.js` agregando las rutas de los componentes: `content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"]` y extendiendo los colores del tema con `louDark: '#0f0f0f'`, `louPink: '#E5b0cb'`, `louLightPink: '#ffd2fb'`.

3. **Configurar Babel:**
   Asegurar que el plugin de nativewind esté en `babel.config.js`.

4. **Estructura de Carpetas sugerida:**

- `/src/components` (Tarjetas, Botones, Filtros)
- `/src/screens` (HomeFeed, Search, PostDetail)
- `/src/lib` (supabase.js)
