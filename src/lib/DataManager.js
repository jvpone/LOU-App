/**
 * DataManager - Persistencia local con AsyncStorage
 *
 * Patrón: Singleton para mantener estado consistente entre componentes
 * Flujo: UI → DataManager → AsyncStorage → UI
 *
 * Ventajas:
 * - Funciona offline (sin conexión a Supabase)
 * - Rápido (datos en memoria local)
 * - Persiste entre sesiones del usuario
 * - Fácil de depurar (JSON legible)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import mockEvents from '../data/mockEvents';
import mockComments from '../data/mockComments';

const STORAGE_KEYS = {
  EVENTS: '@lou_events',
  COMMENTS: (eventoId) => `@lou_comments_${eventoId}`,
  LIKES: (eventoId) => `@lou_likes_${eventoId}`,
};

class DataManager {
  constructor() {
    this.eventsCache = null;
    this.commentsCache = {};
    this.likesCache = {};
  }

  // =========================================================================
  // MÉTODOS DE EVENTOS
  // =========================================================================

  /**
   * Obtiene todos los eventos
   * @returns {Promise<Array>} Array de eventos ordenados por fecha
   */
  async getEvents() {
    try {
      const cached = await this._loadFromStorage(STORAGE_KEYS.EVENTS);
      if (cached && cached.length > 0) {
        this.eventsCache = cached;
        return this._sortByDate(cached);
      }
    } catch (error) {
      console.log('Error loading events from storage:', error);
    }

    // Cargar desde mocks y guardar
    const events = this._sortByDate([...mockEvents]);
    await this._saveToStorage(STORAGE_KEYS.EVENTS, events);
    this.eventsCache = events;
    return events;
  }

  /**
   * Obtiene un evento específico por ID
   * @param {number|string} id - ID del evento
   * @returns {Promise<Object|null>} Evento encontrado o null
   */
  async getEventById(id) {
    const events = await this.getEvents();
    return events.find(e => e.id === parseInt(id, 10)) || null;
  }

  // =========================================================================
  // MÉTODOS DE COMENTARIOS
  // =========================================================================

  /**
   * Obtiene comentarios de un evento ordenados por score descendente
   * @param {number|string} eventoId - ID del evento
   * @returns {Promise<Array>} Array de comentarios
   */
  async getCommentsByEvent(eventoId) {
    try {
      const cached = await this._loadFromStorage(STORAGE_KEYS.COMMENTS(eventoId));
      if (cached && cached.length > 0) {
        this.commentsCache[eventoId] = cached;
        return cached.sort((a, b) => b.score - a.score);
      }
    } catch (error) {
      console.log('Error loading comments from storage:', error);
    }

    // Cargar desde mocks filtrando por evento_id
    const comments = mockComments
      .filter(c => c.evento_id === parseInt(eventoId, 10))
      .sort((a, b) => b.score - a.score);

    await this._saveToStorage(STORAGE_KEYS.COMMENTS(eventoId), comments);
    this.commentsCache[eventoId] = comments;
    return comments;
  }

  /**
   * Agrega un nuevo comentario
   * @param {number|string} eventoId - ID del evento
   * @param {string} contenido - Texto del comentario
   * @param {string} autorUsername - Nombre del autor
   * @returns {Promise<Object>} Comentario creado
   */
  async addComment(eventoId, contenido, autorUsername) {
    const newComment = {
      id: `c${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      evento_id: parseInt(eventoId, 10),
      autor_id: 'current_user',
      autor_username: autorUsername || 'tu_usuario',
      autor_avatar: null,
      contenido: contenido.trim(),
      score: 0,
      created_at: new Date().toISOString(),
    };

    // Obtener comentarios actuales
    const comments = await this.getCommentsByEvent(eventoId);

    // Agregar al inicio (nuevos primero)
    const updatedComments = [newComment, ...comments];

    // Guardar
    await this._saveToStorage(STORAGE_KEYS.COMMENTS(eventoId), updatedComments);
    this.commentsCache[eventoId] = updatedComments;

    return newComment;
  }

  // =========================================================================
  // MÉTODOS DE LIKES
  // =========================================================================

  /**
   * Toggle like de usuario en un evento
   * @param {number|string} eventoId - ID del evento
   * @param {string} userId - ID del usuario
   * @returns {Promise<{liked: boolean, likeCount: number}>}
   */
  async toggleLike(eventoId, userId) {
    const likesKey = STORAGE_KEYS.LIKES(eventoId);
    let likes = [];

    try {
      const cached = await this._loadFromStorage(likesKey);
      if (cached) {
        likes = cached;
      }
    } catch (error) {
      console.log('Error loading likes:', error);
    }

    // Buscar si el usuario ya dio like
    const existingIndex = likes.findIndex(l => l.userId === userId);
    let liked;

    if (existingIndex >= 0) {
      // Ya existe like → eliminar
      likes.splice(existingIndex, 1);
      liked = false;
    } else {
      // No existe → agregar
      likes.push({
        userId,
        eventoId: parseInt(eventoId, 10),
        createdAt: new Date().toISOString(),
      });
      liked = true;
    }

    // Guardar
    await this._saveToStorage(likesKey, likes);
    this.likesCache[eventoId] = likes;

    return {
      liked,
      likeCount: likes.length,
    };
  }

  /**
   * Obtiene cantidad de likes de un evento
   * @param {number|string} eventoId - ID del evento
   * @returns {Promise<number>}
   */
  async getLikeCount(eventoId) {
    try {
      const likes = await this._loadFromStorage(STORAGE_KEYS.LIKES(eventoId));
      return likes ? likes.length : 0;
    } catch (error) {
      console.log('Error getting like count:', error);
      return 0;
    }
  }

  /**
   * Verifica si un usuario dio like a un evento
   * @param {number|string} eventoId - ID del evento
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async hasUserLiked(eventoId, userId) {
    try {
      const likes = await this._loadFromStorage(STORAGE_KEYS.LIKES(eventoId));
      return likes ? likes.some(l => l.userId === userId) : false;
    } catch (error) {
      console.log('Error checking user like:', error);
      return false;
    }
  }

  // =========================================================================
  // MÉTODOS DE VOTACIÓN DE COMENTARIOS
  // =========================================================================

  /**
   * Vota un comentario (upvote o downvote)
   * @param {string} comentarioId - ID del comentario
   * @param {string} userId - ID del usuario
   * @param {'up'|'down'} voteType - Tipo de voto
   * @returns {Promise<{score: number, userVote: 'up'|'down'|null}>}
   */
  async voteComment(comentarioId, userId, voteType) {
    const votesKey = `@lou_comment_votes_${comentarioId}`;
    let votes = [];

    try {
      const cached = await this._loadFromStorage(votesKey);
      if (cached) votes = cached;
    } catch (error) {
      console.log('Error loading comment votes:', error);
    }

    const existingIndex = votes.findIndex(v => v.userId === userId);
    let userVote = null;
    let scoreChange = 0;

    if (existingIndex >= 0) {
      const existingVote = votes[existingIndex].voteType;

      if (existingVote === voteType) {
        votes.splice(existingIndex, 1);
        scoreChange = voteType === 'up' ? -1 : 1;
        userVote = null;
      } else {
        votes[existingIndex].voteType = voteType;
        scoreChange = voteType === 'up' ? 2 : -2;
        userVote = voteType;
      }
    } else {
      votes.push({
        userId,
        comentarioId,
        voteType,
        createdAt: new Date().toISOString(),
      });
      scoreChange = voteType === 'up' ? 1 : -1;
      userVote = voteType;
    }

    await this._saveToStorage(votesKey, votes);
    await this._updateCommentScore(comentarioId, scoreChange);
    const currentScore = await this._getCommentScore(comentarioId);

    return {
      score: currentScore,
      userVote,
    };
  }

  /**
   * Obtiene el voto del usuario en un comentario
   * @param {string} comentarioId - ID del comentario
   * @param {string} userId - ID del usuario
   * @returns {Promise<'up'|'down'|null>}
   */
  async getUserCommentVote(comentarioId, userId) {
    const votesKey = `@lou_comment_votes_${comentarioId}`;
    try {
      const votes = await this._loadFromStorage(votesKey);
      if (!votes) return null;
      const userVote = votes.find(v => v.userId === userId);
      return userVote ? userVote.voteType : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Actualiza el score de un comentario en todos los eventos
   * @param {string} comentarioId - ID del comentario
   * @param {number} scoreChange - Cambio en el score (+1, -1, +2, -2)
   */
  async _updateCommentScore(comentarioId, scoreChange) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentKeys = keys.filter(k => k.startsWith('@lou_comments_'));

      for (const key of commentKeys) {
        const comments = await this._loadFromStorage(key);
        if (!comments) continue;

        const commentIndex = comments.findIndex(c => c.id === comentarioId);
        if (commentIndex >= 0) {
          comments[commentIndex].score = (comments[commentIndex].score || 0) + scoreChange;
          await this._saveToStorage(key, comments);
          break;
        }
      }
    } catch (error) {
      console.error('Error updating comment score:', error);
    }
  }

  /**
   * Obtiene el score actual de un comentario
   * @param {string} comentarioId - ID del comentario
   * @returns {Promise<number>}
   */
  async _getCommentScore(comentarioId) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentKeys = keys.filter(k => k.startsWith('@lou_comments_'));

      for (const key of commentKeys) {
        const comments = await this._loadFromStorage(key);
        if (!comments) continue;

        const comment = comments.find(c => c.id === comentarioId);
        if (comment) return comment.score || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // =========================================================================
  // MÉTODOS DE VOTACIÓN DE ENCUESTAS
  // =========================================================================

  /**
   * Vota en una encuesta
   * @param {string} encuestaId - ID de la encuesta
   * @param {number} opcionIndex - Índice de la opción votada
   * @param {string} userId - ID del usuario
   * @returns {Promise<{opciones: Array, userVote: number|null}>}
   */
  async votePoll(encuestaId, opcionIndex, userId) {
    const pollKey = `@lou_poll_${encuestaId}`;
    let pollData = { opciones: [], votes: {} };

    try {
      const cached = await this._loadFromStorage(pollKey);
      if (cached) pollData = cached;
    } catch (error) {
      console.log('Error loading poll:', error);
    }

    const currentVote = pollData.votes[userId];
    let userVote = opcionIndex;

    if (currentVote === opcionIndex) {
      pollData.opciones[opcionIndex].votos = Math.max(0, pollData.opciones[opcionIndex].votos - 1);
      delete pollData.votes[userId];
      userVote = null;
    } else {
      if (currentVote !== undefined) {
        pollData.opciones[currentVote].votos = Math.max(0, pollData.opciones[currentVote].votos - 1);
      }
      pollData.opciones[opcionIndex].votos = (pollData.opciones[opcionIndex].votos || 0) + 1;
      pollData.votes[userId] = opcionIndex;
    }

    await this._saveToStorage(pollKey, pollData);

    return {
      opciones: pollData.opciones,
      userVote,
    };
  }

  /**
   * Inicializa una encuesta con sus opciones
   * @param {string} encuestaId - ID de la encuesta
   * @param {Array} opciones - Array de {texto, votos}
   */
  async initPoll(encuestaId, opciones) {
    const pollKey = `@lou_poll_${encuestaId}`;
    const existing = await this._loadFromStorage(pollKey);

    if (!existing) {
      const pollData = {
        opciones: opciones.map((opt, i) => ({
          texto: opt.texto,
          votos: opt.votos || 0,
        })),
        votes: {},
      };
      await this._saveToStorage(pollKey, pollData);
      return pollData;
    }

    return existing;
  }

  /**
   * Obtiene datos de una encuesta
   * @param {string} encuestaId - ID de la encuesta
   * @param {string} userId - ID del usuario
   * @returns {Promise<{opciones: Array, userVote: number|null}>}
   */
  async getPollData(encuestaId, userId) {
    const pollKey = `@lou_poll_${encuestaId}`;
    try {
      const pollData = await this._loadFromStorage(pollKey);
      if (!pollData) return { opciones: [], userVote: null };

      return {
        opciones: pollData.opciones,
        userVote: pollData.votes[userId] !== undefined ? pollData.votes[userId] : null,
      };
    } catch (error) {
      return { opciones: [], userVote: null };
    }
  }

  // =========================================================================
  // MÉTODOS DE FILTROS
  // =========================================================================

  /**
   * Guarda los filtros seleccionados por el usuario
   * @param {Object} filters - Objeto con filtros {comuna, temporal, acceso, genero}
   */
  async saveFilters(filters) {
    try {
      await this._saveToStorage('@lou_filters', filters);
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  /**
   * Carga los filtros guardados del usuario
   * @returns {Promise<Object|null>} Filtros guardados o null
   */
  async loadFilters() {
    try {
      return await this._loadFromStorage('@lou_filters');
    } catch (error) {
      console.error('Error loading filters:', error);
      return null;
    }
  }

  // =========================================================================
  // MÉTODOS DE RESPUESTAS (HILOS)
  // =========================================================================

  /**
   * Obtiene respuestas de un comentario
   * @param {string} comentarioId - ID del comentario padre
   * @returns {Promise<Array>} Array de respuestas ordenadas por fecha
   */
  async getRepliesByComment(comentarioId) {
    const repliesKey = `@lou_replies_${comentarioId}`;
    try {
      const cached = await this._loadFromStorage(repliesKey);
      if (cached && cached.length > 0) {
        return cached.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    } catch (error) {
      console.log('Error loading replies:', error);
    }
    return [];
  }

  /**
   * Agrega una respuesta a un comentario
   * @param {string} parentCommentId - ID del comentario padre
   * @param {number} eventoId - ID del evento
   * @param {string} contenido - Texto de la respuesta
   * @param {string} autorUsername - Nombre del autor
   * @returns {Promise<Object>} Respuesta creada
   */
  async addReply(parentCommentId, eventoId, contenido, autorUsername) {
    const newReply = {
      id: `r${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parent_id: parentCommentId,
      evento_id: parseInt(eventoId, 10),
      autor_id: 'current_user',
      autor_username: autorUsername || 'tu_usuario',
      autor_avatar: null,
      contenido: contenido.trim(),
      score: 0,
      created_at: new Date().toISOString(),
    };

    const repliesKey = `@lou_replies_${parentCommentId}`;
    const replies = await this.getRepliesByComment(parentCommentId);
    replies.push(newReply);

    await this._saveToStorage(repliesKey, replies);
    return newReply;
  }

  /**
   * Vota una respuesta (upvote o downvote)
   * @param {string} replyId - ID de la respuesta
   * @param {string} userId - ID del usuario
   * @param {'up'|'down'} voteType - Tipo de voto
   * @returns {Promise<{score: number, userVote: 'up'|'down'|null}>}
   */
  async voteReply(replyId, userId, voteType) {
    const votesKey = `@lou_reply_votes_${replyId}`;
    let votes = [];

    try {
      const cached = await this._loadFromStorage(votesKey);
      if (cached) votes = cached;
    } catch (error) {
      console.log('Error loading reply votes:', error);
    }

    const existingIndex = votes.findIndex(v => v.userId === userId);
    let userVote = null;
    let scoreChange = 0;

    if (existingIndex >= 0) {
      const existingVote = votes[existingIndex].voteType;

      if (existingVote === voteType) {
        votes.splice(existingIndex, 1);
        scoreChange = voteType === 'up' ? -1 : 1;
        userVote = null;
      } else {
        votes[existingIndex].voteType = voteType;
        scoreChange = voteType === 'up' ? 2 : -2;
        userVote = voteType;
      }
    } else {
      votes.push({
        userId,
        replyId,
        voteType,
        createdAt: new Date().toISOString(),
      });
      scoreChange = voteType === 'up' ? 1 : -1;
      userVote = voteType;
    }

    await this._saveToStorage(votesKey, votes);
    await this._updateReplyScore(replyId, scoreChange);
    const currentScore = await this._getReplyScore(replyId);

    return {
      score: currentScore,
      userVote,
    };
  }

  /**
   * Obtiene el voto del usuario en una respuesta
   * @param {string} replyId - ID de la respuesta
   * @param {string} userId - ID del usuario
   * @returns {Promise<'up'|'down'|null>}
   */
  async getUserReplyVote(replyId, userId) {
    const votesKey = `@lou_reply_votes_${replyId}`;
    try {
      const votes = await this._loadFromStorage(votesKey);
      if (!votes) return null;
      const userVote = votes.find(v => v.userId === userId);
      return userVote ? userVote.voteType : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Actualiza el score de una respuesta
   * @param {string} replyId - ID de la respuesta
   * @param {number} scoreChange - Cambio en el score
   */
  async _updateReplyScore(replyId, scoreChange) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const replyKeys = keys.filter(k => k.startsWith('@lou_replies_'));

      for (const key of replyKeys) {
        const replies = await this._loadFromStorage(key);
        if (!replies) continue;

        const replyIndex = replies.findIndex(r => r.id === replyId);
        if (replyIndex >= 0) {
          replies[replyIndex].score = (replies[replyIndex].score || 0) + scoreChange;
          await this._saveToStorage(key, replies);
          break;
        }
      }
    } catch (error) {
      console.error('Error updating reply score:', error);
    }
  }

  /**
   * Obtiene el score actual de una respuesta
   * @param {string} replyId - ID de la respuesta
   * @returns {Promise<number>}
   */
  async _getReplyScore(replyId) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const replyKeys = keys.filter(k => k.startsWith('@lou_replies_'));

      for (const key of replyKeys) {
        const replies = await this._loadFromStorage(key);
        if (!replies) continue;

        const reply = replies.find(r => r.id === replyId);
        if (reply) return reply.score || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // =========================================================================
  // MÉTODOS AUXILIARES
  // =========================================================================

  /**
   * Lee datos de AsyncStorage y parsea JSON
   * @param {string} key - Clave de almacenamiento
   * @returns {Promise<any>} Datos parseados o null
   */
  async _loadFromStorage(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  /**
   * Convierte datos a JSON y guarda en AsyncStorage
   * @param {string} key - Clave de almacenamiento
   * @param {any} data - Datos a guardar
   */
  async _saveToStorage(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  /**
   * Ordena eventos por fecha de inicio ascendente
   * @param {Array} events - Array de eventos
   * @returns {Array} Eventos ordenados
   */
  _sortByDate(events) {
    return events.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
  }

  /**
   * Limpia toda la persistencia (útil para testing)
   */
  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const louKeys = keys.filter(k => k.startsWith('@lou_'));
      await AsyncStorage.multiRemove(louKeys);
      this.eventsCache = null;
      this.commentsCache = {};
      this.likesCache = {};
      console.log('DataManager: All local data cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

// Exporta instancia única (singleton)
export default new DataManager();
