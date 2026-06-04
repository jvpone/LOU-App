# Configuración de Supabase - LOU-App

## Paso 1: Crear proyecto en Supabase

1. Ve a https://supabase.com/dashboard
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - **Name**: LOU-App
   - **Database Password**: (guarda esta contraseña)
   - **Region**: US East (o la más cercana a Chile)
   - **Pricing Plan**: Free (gratuito)
5. Espera 2-3 minutos a que se cree el proyecto

## Paso 2: Obtener credenciales

1. En tu proyecto, ve a **Settings** (ícono de engranaje) → **API**
2. Copia estos dos valores:
   - **Project URL** (ejemplo: `https://abcdefghijk.supabase.co`)
   - **anon public key** (string largo que empieza con `eyJ...`)

**IMPORTANTE**: La anon key DEBE empezar con `eyJ` y ser muy larga (200+ caracteres). Si ves una clave corta que empieza con `sb_publishable_`, esa NO es la anon key correcta. Busca la sección "Project API keys" y copia la clave llamada **"anon"** o **"public"**.

## Paso 3: Configurar variables de entorno

El archivo `.env` ya está creado con tus credenciales. Verifica que la anon key empiece con `eyJ`:

```bash
# Abre el archivo .env y verifica:
EXPO_PUBLIC_SUPABASE_URL=https://jlyxkiztladsmwtowtsd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Debe ser LARGA
```

Si tu anon key NO empieza con `eyJ`, ve a Supabase Dashboard → Settings → API y copia la clave correcta.

## Paso 4: Ejecutar el esquema SQL

**IMPORTANTE**: Si ya ejecutaste el script anteriormente y dio error, primero limpia la base de datos:

1. En Supabase Dashboard, ve a **SQL Editor**
2. Ejecuta esta query para limpiar todo:
   ```sql
   DROP TABLE IF EXISTS encuesta_votos, encuesta_opciones, encuestas, likes, comentarios, noticias, eventos, profiles CASCADE;
   DROP TYPE IF EXISTS comuna_type, genero_type, acceso_type, encuesta_tipo, role_type CASCADE;
   ```

3. Ahora ejecuta el script corregido:
   - Abre el archivo `supabase/schema.sql` en tu editor
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en **"Run"** (o presiona Ctrl+Enter)
   - Espera a que se ejecuten todas las queries

**NOTA**: El script ahora incluye la creación de usuarios dummy en `auth.users` antes de insertar en `profiles`, lo que soluciona el error de foreign key.

## Paso 5: Verificar la instalación

En el SQL Editor, ejecuta esta query para verificar que todo se creó:

```sql
SELECT 
  'eventos' as tabla, COUNT(*) as total FROM eventos
UNION ALL
SELECT 'comentarios', COUNT(*) FROM comentarios
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'encuestas', COUNT(*) FROM encuestas
UNION ALL
SELECT 'perfiles', COUNT(*) FROM profiles;
```

Deberías ver:
- eventos: 26
- comentarios: 11
- likes: 15
- encuestas: 2
- perfiles: 3

## Paso 6: Probar la conexión

En tu app, el cliente Supabase ya está configurado en `src/lib/supabase.js`.
Para probar la conexión, puedes agregar temporalmente en cualquier componente:

```javascript
import { supabase } from '../lib/supabase';

// Probar conexión
const testConnection = async () => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .limit(1);
  
  console.log('Conexión exitosa:', data);
  console.log('Error (si hay):', error);
};
```

## Estructura de la base de datos

### Tablas creadas:
- **profiles**: Perfiles de usuario (3 usuarios de prueba)
- **eventos**: Eventos musicales (26 eventos del Gran Concepción)
- **noticias**: Noticias (3 noticias publicadas)
- **comentarios**: Comentarios con score (11 comentarios)
- **likes**: Likes con constraints únicos (15 likes)
- **encuestas**: Encuestas staff y comunidad (2 encuestas)
- **encuesta_opciones**: Opciones de encuesta (7 opciones)
- **encuesta_votos**: Votos de usuarios (6 votos)

### Triggers automáticos:
- El `score` de los comentarios se recalcula automáticamente cuando:
  - Se agrega/elimina un like al comentario
  - Se vota en una encuesta de comunidad vinculada al comentario
- Fórmula: `score = (likes × 2) + votos_encuesta`

### Row Level Security (RLS):
- Todas las tablas tienen RLS habilitado
- Políticas configuradas para lectura pública y escritura autenticada
- Los usuarios solo pueden modificar sus propios datos

## Próximos pasos

Una vez configurado Supabase:
1. Confirma que la Fase 0 está lista
2. Continúa con la Fase 1 del prompt maestro
3. El agente reemplazará los datos mock con queries reales a Supabase

## Solución de problemas

### Error "violates foreign key constraint profiles_id_fkey"
**Causa**: Los usuarios dummy no existían en `auth.users`
**Solución**: El script `schema.sql` ya está corregido. Primero ejecuta la limpieza (Paso 4) y luego vuelve a ejecutar el script completo.

### Error "relation does not exist"
- Asegúrate de haber ejecutado TODO el script `schema.sql`
- Verifica que no hayas copiado solo una parte
- Si ya ejecutaste antes, limpia primero con el DROP del Paso 4

### Error "permission denied"
- Verifica que las RLS policies se crearon correctamente
- Ejecuta: `SELECT * FROM pg_policies WHERE tablename = 'eventos';`

### La app no conecta con Supabase
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- **Verifica que la anon key empiece con `eyJ`** (no con `sb_publishable_`)
- Reinicia el servidor de Expo: `npx expo start --clear`
- Verifica en la consola que no haya errores de conexión

### Error "JWT" o "Invalid API key"
- La anon key está incorrecta. Ve a Supabase Dashboard → Settings → API
- Copia la clave de la sección **"Project API keys"** → **"anon public"**
- Debe empezar con `eyJ` y tener 200+ caracteres
- Actualiza el archivo `.env` con la clave correcta
