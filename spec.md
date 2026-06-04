# Especificación del Proyecto: LOU-App (Prototipo Evaluación 2)

## Stack Tecnológico

- Framework: React Native (Expo)
- UI/Estilos: NativeWind (Tailwind CSS para React Native)
- Base de Datos y Backend: Supabase (PostgreSQL)
- Lenguaje: JavaScript

## Diseño y UI

- **Color Fondo Principal:** `#0f0f0f` (Negro profundo)
- **Colores Dominantes/Acentos:** `#E5b0cb` (Rosa apagado) / `#ffd2fb` (Rosa claro brillante)
- **Fuentes (DEBEN cargarse vía expo-font):**
  - Títulos y subtítulos: `Lovelo`
  - Texto de cuerpo y UI: `Montserrat`
- **Estilo General:** Diseño básico, limpio, oscuro (Dark Mode nativo), cuidando la distribución y márgenes (safe areas).
- **Principio visual:** Cuidar micro-interacciones (feedback táctil en botones, transiciones suaves entre pantallas) y evitar layouts genéricos tipo "template".

## Requerimientos Funcionales (Estrictos)

### Requerimiento 1: Listar Eventos (Home/Feed)

- **Descripción:** Lista paginada de eventos musicales usando un `FlatList`.
- **Filtro por defecto:** Mostrar solo eventos donde `comuna` pertenezca al Gran Concepción y `fecha_inicio` esté dentro de los próximos 30 días. Orden cronológico ascendente.
- **Paginación:** Máximo 10 eventos por carga (usar scroll controlado/onEndReached).
- **UI de Tarjeta:** Nombre, fecha, hora, ubicación e imagen miniatura.
- **Limitación Estricta:** NO mostrar eventos pasados. NO mostrar eventos fuera del Gran Concepción.
- **Tabla origen:** `eventos`.

### Requerimiento 2: Búsqueda de Eventos por Filtro

- **Descripción:** Interfaz para refinar la búsqueda del requerimiento 1.
- **Filtros (Desplegables/Selects):**
  1. Geográfico: 'Concepción', 'Hualpén', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Penco', 'Tomé'.
  2. Temporal: "Este fin de semana", "Próxima semana", "Próximos 15 días".
  3. Acceso: 'gratis' o 'pago'.
  4. Género: Selector de enum `genero_type`.
- **Lógica:** Booleana inclusiva (AND). Todos los filtros seleccionados deben cumplirse.
- **Limitación Estricta:** NO usar búsqueda de texto libre. Si no hay resultados, mostrar componente de estado vacío con el texto: "No hay eventos agendados para esta selección".

### Requerimiento 3: Interactuar con la Publicación

- **Descripción:** Módulo social en el detalle del evento/noticia.
- **Acciones:**
  - _Me gusta:_ Inserta registro en la tabla `likes`. Requiere autenticación.
  - _Comentar:_ Input de texto limitado a 500 caracteres. Inserta en tabla `comentarios`.
  - _Compartir:_ Usa la API nativa `Share` de React Native.
- **Votaciones (Encuestas):**
  - Mostrar encuestas tipo 'staff' incrustadas en el artículo (tabla `encuestas` y `encuesta_opciones`).
  - Permitir a los usuarios crear encuestas rápidas tipo 'comunidad' dentro de los comentarios.
- **Ordenamiento:** Los comentarios deben ordenarse por la columna generada `score` (relevancia basada en likes y votos) de forma descendente.

## Base de Datos (Esquema Supabase Resumido)

- `profiles`: id, username, avatar_url, role.
- `eventos`: id, titulo, imagen_url, comuna, fecha_inicio, acceso, genero, lugar.
- `noticias`: id, titulo, contenido, publicado.
- `comentarios`: id, noticia_id, evento_id, autor_id, contenido (max 500), score.
- `likes`: user_id, comentario_id, noticia_id, evento_id.
- `encuestas` y `encuesta_opciones`: para el sistema de votaciones.

## Estados de Carga y Error

- **Skeleton Loaders:** Mientras se cargan eventos (Req 1) o comentarios (Req 3), mostrar placeholders animados (shimmer effect) con la misma estructura visual que las tarjetas/comentarios finales. Fondo del skeleton: `#1a1a1a`, brillo: `#2a2a2a`.
- **Error de Red / Supabase:** Si la conexión falla o Supabase retorna error, mostrar un componente de error centrado con el texto: "Error al cargar los datos. Verifica tu conexión." y un botón "Reintentar" que ejecute nuevamente la query.
- **Error al enviar comentario/like:** Si la inserción falla, mostrar un toast/alerta con el texto: "No se pudo completar la acción. Intenta nuevamente." y NO limpiar el input de texto.

## Estados de Interacción

- **Botón "Enviar comentario":** Debe deshabilitarse (opacity 0.5, disabled=true) mientras la petición de inserción esté en vuelo (loading state). Rehabilitarse al recibir respuesta (éxito o error).
- **Botón "Me gusta":** Debe mostrar estado toggle (corazón vacío ↔ corazón relleno con `#E5b0cb`). Si el usuario no está autenticado, al presionar "Me gusta" o "Comentar" se debe mostrar un mensaje: "Debes iniciar sesión para interactuar."
- **Input de comentario:** Contador visible de caracteres restantes (ej: "342/500"). Deshabilitar el botón de enviar cuando el input esté vacío o solo contenga espacios en blanco.

## Paginación y Filtros

- **Reset de paginación:** Al aplicar o cambiar cualquier filtro (Req 2), la paginación debe reiniciarse a la página 1 y limpiar los resultados anteriores antes de mostrar los nuevos.
- **Filtro geográfico:** Es de selección única (single-select). Solo se puede seleccionar una comuna a la vez.
- **Fin de lista:** Cuando no haya más eventos que cargar (se alcanzó el final de los resultados), mostrar un texto centrado: "No hay más eventos para mostrar."

## Definiciones Temporales

- **"Este fin de semana":** Desde el viernes a las 00:00 hasta el domingo a las 23:59 de la semana actual.
- **"Próxima semana":** Desde el lunes a las 00:00 hasta el domingo a las 23:59 de la semana siguiente a la actual.
- **"Próximos 15 días":** Desde hoy (00:00) hasta 15 días después (23:59).

## Fórmula de Score de Comentarios

- **Cálculo:** `score = (cantidad_likes * 2) + cantidad_votos_encuesta`
- **Actualización:** El score se recalcula vía trigger de PostgreSQL en la tabla `comentarios` cada vez que se inserta/elimina un registro en `likes` (con `comentario_id` no nulo) o se registra un voto en `encuesta_opciones`.
- **Constraint de unicidad:** La tabla `likes` debe tener un constraint `UNIQUE(user_id, comentario_id)` y `UNIQUE(user_id, evento_id)` para prevenir duplicados.

## Manejo de Imágenes

- **Imagen fallida:** Si `imagen_url` de un evento no carga, mostrar un placeholder con fondo `#1a1a1a` y un ícono genérico de evento.
- **Imagen en carga:** Mostrar el skeleton loader hasta que la imagen termine de descargar.

## Encuestas de Comunidad

- **Relación con comentarios:** Una encuesta de comunidad es un registro en la tabla `encuestas` con `tipo = 'comunidad'` y un campo `comentario_id` (FK a `comentarios`). El comentario actúa como texto descriptivo de la encuesta.
- **Límite:** Máximo 4 opciones por encuesta de comunidad.
