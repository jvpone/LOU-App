# Persistencia Local - DataManager

## Arquitectura

La app usa una clase **DataManager** (patrón **Singleton**) que centraliza toda la lógica de persistencia local usando **AsyncStorage**.

## Por qué AsyncStorage

- Persistencia nativa de React Native
- Almacena datos como JSON (fácil de depurar)
- Funciona offline
- Rápido para prototipos

## Flujo de datos

1. App inicia → DataManager carga datos de AsyncStorage
2. Si no hay datos → carga de mocks y guarda en AsyncStorage
3. Usuario interactúa → DataManager actualiza AsyncStorage
4. App se cierra → datos persisten
5. App reinicia → DataManager carga datos guardados

## Métodos principales

### Eventos
- `getEvents()`: obtiene lista de eventos (desde cache o mocks)
- `getEventById(id)`: obtiene un evento específico

### Comentarios
- `getCommentsByEvent(eventoId)`: obtiene comentarios de un evento ordenados por score
- `addComment(eventoId, contenido, autorUsername)`: agrega comentario y persiste

### Likes
- `toggleLike(eventoId, userId)`: agrega/elimina like y persiste
- `getLikeCount(eventoId)`: obtiene cantidad de likes
- `hasUserLiked(eventoId, userId)`: verifica si usuario dio like

### Utilidades
- `clearAll()`: limpia toda la persistencia (testing)

## Estructura de datos en AsyncStorage

| Key | Descripción |
|-----|-------------|
| `@lou_events` | Array de eventos |
| `@lou_comments_{eventoId}` | Array de comentarios por evento |
| `@lou_likes_{eventoId}` | Array de likes por evento |

## Uso típico

```javascript
import DataManager from '../lib/DataManager';

// Cargar eventos
const events = await DataManager.getEvents();

// Agregar comentario
const newComment = await DataManager.addComment(
  eventId,
  'Mi comentario',
  'usuario123'
);

// Toggle like
const result = await DataManager.toggleLike(eventId, userId);
console.log(result.liked); // true/false
console.log(result.likeCount); // número de likes
```
