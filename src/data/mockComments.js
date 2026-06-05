const mockComments = [
  {
    id: "c1a2b3c4-1111-2222-3333-444455556666",
    evento_id: 1,
    autor_id: "u1a2b3c4-1111-2222-3333-444455556661",
    autor_username: "rockero_fan",
    autor_avatar: null,
    contenido: "¡Este evento es imperdible! La banda que toca tiene temas increíbles.",
    score: 28,
    created_at: "2026-06-01T10:00:00"
  },
  {
    id: "c2a2b3c4-1111-2222-3333-444455556667",
    evento_id: 1,
    autor_id: "u2a2b3c4-1111-2222-3333-444455556662",
    autor_username: "melomano_conce",
    autor_avatar: null,
    contenido: "¿Alguien sabe si habrá food trucks cerca del estadio?",
    score: 15,
    created_at: "2026-06-01T12:30:00"
  },
  {
    id: "c3a2b3c4-1111-2222-3333-444455556668",
    evento_id: 1,
    autor_id: "u3a2b3c4-1111-2222-3333-444455556663",
    autor_username: "dj_electronica",
    autor_avatar: null,
    contenido: "Va a estar buenísimo. Yo ya compré mis entradas.",
    score: 22,
    created_at: "2026-06-02T08:15:00"
  },
  {
    id: "c4a2b3c4-1111-2222-3333-444455556669",
    evento_id: 2,
    autor_id: "u4a2b3c4-1111-2222-3333-444455556664",
    autor_username: "rave_chico",
    autor_avatar: null,
    contenido: "¿Cuál es el line up completo del festival?",
    score: 18,
    created_at: "2026-06-01T14:00:00"
  },
  {
    id: "c5a2b3c4-1111-2222-3333-444455556670",
    evento_id: 2,
    autor_id: "u5a2b3c4-1111-2222-3333-444455556665",
    autor_username: "electro_fan",
    autor_avatar: null,
    contenido: "La última vez estuvo espectacular. Van a repetir el mismoDj?",
    score: 8,
    created_at: "2026-06-02T09:45:00"
  },
  {
    id: "c6a2b3c4-1111-2222-3333-444455556671",
    evento_id: 3,
    autor_id: "u6a2b3c4-1111-2222-3333-444455556666",
    autor_username: "jazz lover",
    autor_avatar: null,
    contenido: "Perfecto para una cita nocturna en el parque",
    score: 31,
    created_at: "2026-05-30T18:00:00"
  },
  {
    id: "c7a2b3c4-1111-2222-3333-444455556672",
    evento_id: 4,
    autor_id: "u7a2b3c4-1111-2222-3333-444455556667",
    autor_username: "pop_latino",
    autor_avatar: null,
    contenido: "¿A qué hora empieza el show de apertura?",
    score: 5,
    created_at: "2026-05-31T20:30:00"
  },
  {
    id: "c8a2b3c4-1111-2222-3333-444455556673",
    evento_id: 5,
    autor_id: "u8a2b3c4-1111-2222-3333-444455556668",
    autor_username: "indie_head",
    autor_avatar: null,
    contenido: "Me encanta que sea gratis, ojalá siempre haya eventos así",
    score: 12,
    created_at: "2026-06-02T11:00:00"
  },
  {
    id: "c9a2b3c4-1111-2222-3333-444455556674",
    evento_id: 1,
    autor_id: "u9a2b3c4-1111-2222-3333-444455556669",
    autor_username: "conce_metal",
    autor_avatar: null,
    contenido: "¿Alguien tiene el setlist de la última vez que tocaron acá?",
    score: 3,
    created_at: "2026-06-03T07:20:00"
  },
  {
    id: "c10a2b3c4-1111-2222-3333-444455556675",
    evento_id: 6,
    autor_id: "u10a2b3c4-1111-2222-3333-444455556670",
    autor_username: "techno_lover",
    autor_avatar: null,
    contenido: "Esta edición va a ser mejor que la anterior, lo presiento",
    score: 19,
    created_at: "2026-05-29T22:00:00"
  },
  {
    id: "r1a2b3c4-1111-2222-3333-444455556666",
    parent_id: "c1a2b3c4-1111-2222-3333-444455556666",
    evento_id: 1,
    autor_id: "u2a2b3c4-1111-2222-3333-444455556662",
    autor_username: "melomano_conce",
    contenido: "Totalmente de acuerdo, la banda es increíble!",
    score: 5,
    created_at: "2026-06-01T11:00:00"
  },
  {
    id: "r2a2b3c4-1111-2222-3333-444455556667",
    parent_id: "c1a2b3c4-1111-2222-3333-444455556666",
    evento_id: 1,
    autor_id: "u3a2b3c4-1111-2222-3333-444455556663",
    autor_username: "dj_electronica",
    contenido: "Yo también voy a ir, nos vemos allá!",
    score: 3,
    created_at: "2026-06-01T12:00:00"
  },
];

export default mockComments;
