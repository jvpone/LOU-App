-- =====================================================
-- LOU-App: Esquema Completo de Base de Datos
-- Supabase (PostgreSQL)
-- =====================================================

-- =====================================================
-- 1. ENUMS (Tipos personalizados)
-- =====================================================

CREATE TYPE comuna_type AS ENUM (
  'Concepción',
  'Hualpén',
  'Talcahuano',
  'Chiguayante',
  'San Pedro de la Paz',
  'Penco',
  'Tomé'
);

CREATE TYPE genero_type AS ENUM (
  'rock',
  'pop',
  'electronica',
  'jazz',
  'otro'
);

CREATE TYPE acceso_type AS ENUM (
  'gratis',
  'pago'
);

CREATE TYPE encuesta_tipo AS ENUM (
  'staff',
  'comunidad'
);

CREATE TYPE role_type AS ENUM (
  'user',
  'admin'
);

-- =====================================================
-- 2. TABLAS
-- =====================================================

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role role_type DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  imagen_url TEXT,
  comuna comuna_type NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  acceso acceso_type NOT NULL,
  genero genero_type NOT NULL,
  lugar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de noticias
CREATE TABLE noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  publicado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL CHECK (char_length(contenido) <= 500),
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comentario_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_like_comentario UNIQUE (user_id, comentario_id),
  CONSTRAINT unique_like_evento UNIQUE (user_id, evento_id),
  CONSTRAINT unique_like_noticia UNIQUE (user_id, noticia_id)
);

-- Tabla de encuestas
CREATE TABLE encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo encuesta_tipo NOT NULL,
  pregunta TEXT NOT NULL,
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de opciones de encuesta
CREATE TABLE encuesta_opciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID REFERENCES encuestas(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  votos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de votos de encuesta
CREATE TABLE encuesta_votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opcion_id UUID REFERENCES encuesta_opciones(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_voto UNIQUE (user_id, opcion_id)
);

-- =====================================================
-- 3. ÍNDICES (Para mejorar rendimiento)
-- =====================================================

CREATE INDEX idx_eventos_comuna_fecha ON eventos(comuna, fecha_inicio);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio);
CREATE INDEX idx_comentarios_evento ON comentarios(evento_id, score DESC);
CREATE INDEX idx_comentarios_noticia ON comentarios(noticia_id, score DESC);
CREATE INDEX idx_likes_comentario ON likes(comentario_id);
CREATE INDEX idx_likes_evento ON likes(evento_id);

-- =====================================================
-- 4. FUNCIONES Y TRIGGERS PARA RECALCULAR SCORE
-- =====================================================

-- Función para recalcular score de comentario cuando cambia likes
CREATE OR REPLACE FUNCTION recalcular_score_comentario()
RETURNS TRIGGER AS $$
DECLARE
  v_comentario_id UUID;
  v_likes_count INTEGER;
  v_votos_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_comentario_id := OLD.comentario_id;
  ELSE
    v_comentario_id := NEW.comentario_id;
  END IF;

  IF v_comentario_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_likes_count
    FROM likes
    WHERE comentario_id = v_comentario_id;

    SELECT COALESCE(SUM(eo.votos), 0) INTO v_votos_count
    FROM encuesta_opciones eo
    JOIN encuestas e ON e.id = eo.encuesta_id
    WHERE e.comentario_id = v_comentario_id
      AND e.tipo = 'comunidad';

    UPDATE comentarios
    SET score = (v_likes_count * 2) + v_votos_count
    WHERE id = v_comentario_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para likes
CREATE TRIGGER trigger_recalcular_score_likes
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION recalcular_score_comentario();

-- Función para recalcular score cuando cambia votos de encuesta
CREATE OR REPLACE FUNCTION recalcular_score_por_voto()
RETURNS TRIGGER AS $$
DECLARE
  v_encuesta_id UUID;
  v_comentario_id UUID;
  v_likes_count INTEGER;
  v_votos_count INTEGER;
BEGIN
  SELECT eo.encuesta_id INTO v_encuesta_id
  FROM encuesta_opciones eo
  WHERE eo.id = (CASE WHEN TG_OP = 'DELETE' THEN OLD.opcion_id ELSE NEW.opcion_id END);

  SELECT e.comentario_id INTO v_comentario_id
  FROM encuestas e
  WHERE e.id = v_encuesta_id
    AND e.tipo = 'comunidad';

  IF v_comentario_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_likes_count
    FROM likes
    WHERE comentario_id = v_comentario_id;

    SELECT COALESCE(SUM(eo.votos), 0) INTO v_votos_count
    FROM encuesta_opciones eo
    WHERE eo.encuesta_id = v_encuesta_id;

    UPDATE comentarios
    SET score = (v_likes_count * 2) + v_votos_count
    WHERE id = v_comentario_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para votos de encuesta
CREATE TRIGGER trigger_recalcular_score_votos
AFTER INSERT OR DELETE ON encuesta_votos
FOR EACH ROW
EXECUTE FUNCTION recalcular_score_por_voto();

-- Función para actualizar votos en encuesta_opciones
CREATE OR REPLACE FUNCTION actualizar_votos_opcion()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE encuesta_opciones
    SET votos = votos + 1
    WHERE id = NEW.opcion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE encuesta_opciones
    SET votos = votos - 1
    WHERE id = OLD.opcion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_actualizar_votos
AFTER INSERT OR DELETE ON encuesta_votos
FOR EACH ROW
EXECUTE FUNCTION actualizar_votos_opcion();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuesta_opciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuesta_votos ENABLE ROW LEVEL SECURITY;

-- PROFILES: Todos pueden ver, solo autenticados pueden insertar/actualizar propio
CREATE POLICY "Profiles son visibles para todos"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear su perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- EVENTOS: Todos pueden ver (lectura pública)
CREATE POLICY "Eventos son visibles para todos"
  ON eventos FOR SELECT
  USING (true);

-- NOTICIAS: Solo publicadas son visibles
CREATE POLICY "Noticias publicadas son visibles para todos"
  ON noticias FOR SELECT
  USING (publicado = true);

-- COMENTARIOS: Todos pueden ver, autenticados pueden insertar, solo propio para update/delete
CREATE POLICY "Comentarios son visibles para todos"
  ON comentarios FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden comentar"
  ON comentarios FOR INSERT
  WITH CHECK (auth.uid() = autor_id);

CREATE POLICY "Usuarios pueden editar sus propios comentarios"
  ON comentarios FOR UPDATE
  USING (auth.uid() = autor_id);

CREATE POLICY "Usuarios pueden eliminar sus propios comentarios"
  ON comentarios FOR DELETE
  USING (auth.uid() = autor_id);

-- LIKES: Todos pueden ver, autenticados pueden dar like, solo propio para delete
CREATE POLICY "Likes son visibles para todos"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden dar like"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar sus propios likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- ENCUESTAS: Todos pueden ver, autenticados pueden crear
CREATE POLICY "Encuestas son visibles para todos"
  ON encuestas FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear encuestas"
  ON encuestas FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles));

-- ENCUESTA OPCIONES: Todos pueden ver, autenticados pueden crear
CREATE POLICY "Opciones de encuesta son visibles para todos"
  ON encuesta_opciones FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear opciones"
  ON encuesta_opciones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM encuestas e
      WHERE e.id = encuesta_id
    )
  );

-- ENCUESTA VOTOS: Todos pueden ver, autenticados pueden votar, solo propio para delete
CREATE POLICY "Votos de encuesta son visibles para todos"
  ON encuesta_votos FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden votar"
  ON encuesta_votos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden cambiar sus votos"
  ON encuesta_votos FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. SEED DATA (Datos de prueba)
-- =====================================================

-- Primero crear usuarios dummy en auth.users (requerido por FK de profiles)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'carlos@example.com', '$2a$10$dummy', NOW(), NOW(), NOW(), '{"provider": "email"}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'maria@example.com', '$2a$10$dummy', NOW(), NOW(), NOW(), '{"provider": "email"}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'pedro@example.com', '$2a$10$dummy', NOW(), NOW(), NOW(), '{"provider": "email"}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

-- Perfiles de usuarios de prueba
INSERT INTO profiles (id, username, avatar_url, role) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'carlos_music', NULL, 'user'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'maria_rock', NULL, 'user'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'pedro_dj', NULL, 'user');

-- Eventos (25+ eventos dentro de los próximos 30 días)
INSERT INTO eventos (titulo, imagen_url, comuna, fecha_inicio, acceso, genero, lugar) VALUES
  ('Rock en el Parque', 'https://picsum.photos/seed/rock1/400/300', 'Concepción', '2026-06-08 19:00:00', 'gratis', 'rock', 'Parque Ecuador'),
  ('Festival Electrónico Conce', 'https://picsum.photos/seed/electro1/400/300', 'Talcahuano', '2026-06-10 22:00:00', 'pago', 'electronica', 'Club Náutico'),
  ('Jazz en la Noche', 'https://picsum.photos/seed/jazz1/400/300', 'Concepción', '2026-06-12 21:00:00', 'pago', 'jazz', 'Teatro Concepción'),
  ('Pop Summer Fest', 'https://picsum.photos/seed/pop1/400/300', 'San Pedro de la Paz', '2026-06-14 18:00:00', 'gratis', 'pop', 'Plaza de Armas'),
  ('Indie Rock Night', 'https://picsum.photos/seed/indie1/400/300', 'Chiguayante', '2026-06-15 20:00:00', 'pago', 'rock', 'Bar El Refugio'),
  ('Techno Underground', 'https://picsum.photos/seed/techno1/400/300', 'Hualpén', '2026-06-16 23:00:00', 'pago', 'electronica', 'Bodega Cultural'),
  ('Feria Musical Gratis', 'https://picsum.photos/seed/feria1/400/300', 'Concepción', '2026-06-18 15:00:00', 'gratis', 'otro', 'Plaza de la Independencia'),
  ('Blues & Jazz Fusion', 'https://picsum.photos/seed/blues1/400/300', 'Penco', '2026-06-19 20:30:00', 'pago', 'jazz', 'Centro Cultural Penco'),
  ('Rock Clásico Chileno', 'https://picsum.photos/seed/rockcl1/400/300', 'Concepción', '2026-06-20 21:00:00', 'pago', 'rock', 'Casa del Arte'),
  ('DJ Set: House Music', 'https://picsum.photos/seed/house1/400/300', 'Talcahuano', '2026-06-21 22:00:00', 'pago', 'electronica', 'Bar La Fuente'),
  ('Concierto Acústico', 'https://picsum.photos/seed/acustico1/400/300', 'Concepción', '2026-06-22 19:00:00', 'gratis', 'pop', 'Biblioteca Municipal'),
  ('Punk Rock Revival', 'https://picsum.photos/seed/punk1/400/300', 'Tomé', '2026-06-23 21:00:00', 'pago', 'rock', 'Galpón Cultural'),
  ('Electro Pop Party', 'https://picsum.photos/seed/electropop1/400/300', 'San Pedro de la Paz', '2026-06-24 22:00:00', 'pago', 'electronica', 'Centro de Eventos'),
  ('Jazz Brunch', 'https://picsum.photos/seed/jazzbrunch/400/300', 'Concepción', '2026-06-25 12:00:00', 'gratis', 'jazz', 'Café Literario'),
  ('Metal Night', 'https://picsum.photos/seed/metal1/400/300', 'Chiguayante', '2026-06-26 22:00:00', 'pago', 'rock', 'Sala de Conciertos'),
  ('Reggaeton Fest', 'https://picsum.photos/seed/reggaeton1/400/300', 'Talcahuano', '2026-06-27 21:00:00', 'pago', 'otro', 'Estadio Municipal'),
  ('Folklore Chileno', 'https://picsum.photos/seed/folklore1/400/300', 'Concepción', '2026-06-28 18:00:00', 'gratis', 'otro', 'Plaza Perú'),
  ('Synthwave Night', 'https://picsum.photos/seed/synth1/400/300', 'Hualpén', '2026-06-29 23:00:00', 'pago', 'electronica', 'Club Nocturno'),
  ('Singer Songwriter', 'https://picsum.photos/seed/singer1/400/300', 'Concepción', '2026-06-30 20:00:00', 'gratis', 'pop', 'Auditorio UdeC'),
  ('Cumbia & Salsa', 'https://picsum.photos/seed/cumbia1/400/300', 'Penco', '2026-07-01 21:00:00', 'pago', 'otro', 'Salón de Baile'),
  ('Rock Alternativo', 'https://picsum.photos/seed/altrock1/400/300', 'Concepción', '2026-07-02 20:00:00', 'pago', 'rock', 'Teatro Biobío'),
  ('Ambient & Chill', 'https://picsum.photos/seed/ambient1/400/300', 'San Pedro de la Paz', '2026-07-03 19:00:00', 'gratis', 'electronica', 'Parque Laguna'),
  ('Tributo a Los Prisioneros', 'https://picsum.photos/seed/tributo1/400/300', 'Concepción', '2026-07-04 21:00:00', 'pago', 'rock', 'Casa del Arte'),
  ('Latin Jazz Ensemble', 'https://picsum.photos/seed/latinjazz1/400/300', 'Talcahuano', '2026-07-05 20:00:00', 'pago', 'jazz', 'Centro Cultural'),
  ('Festival de Bandas', 'https://picsum.photos/seed/bandas1/400/300', 'Chiguayante', '2026-07-06 17:00:00', 'gratis', 'rock', 'Anfiteatro Municipal'),
  ('Deep House Session', 'https://picsum.photos/seed/deephouse1/400/300', 'Concepción', '2026-07-07 22:00:00', 'pago', 'electronica', 'Rooftop Bar');

-- Noticias (3 noticias publicadas)
INSERT INTO noticias (titulo, contenido, publicado) VALUES
  ('La escena musical de Concepción crece', 'Un análisis del crecimiento de la escena musical en el Gran Concepción durante 2026...', true),
  ('Nuevos venues abren sus puertas', 'Tres nuevos espacios culturales han abierto en el último mes...', true),
  ('Entrevista: Banda local "Los del Sur"', 'Conversamos con la banda revelación de la región...', true);

-- Comentarios (10 comentarios con scores variados)
INSERT INTO comentarios (id, evento_id, autor_id, contenido, score, created_at) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', (SELECT id FROM eventos WHERE titulo = 'Rock en el Parque'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '¡Excelente evento! La música estuvo increíble y el ambiente muy bueno.', 20, '2026-06-05 10:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', (SELECT id FROM eventos WHERE titulo = 'Rock en el Parque'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Muy buena organización, pero faltó más variedad de comida.', 12, '2026-06-05 11:30:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', (SELECT id FROM eventos WHERE titulo = 'Festival Electrónico Conce'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Los DJs estuvieron brutales, la mejor noche electrónica del año.', 30, '2026-06-06 09:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', (SELECT id FROM eventos WHERE titulo = 'Jazz en la Noche'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Una velada mágica, el saxofonista es un genio.', 18, '2026-06-07 14:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', (SELECT id FROM eventos WHERE titulo = 'Pop Summer Fest'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Muy divertido, ideal para ir en familia. Los niños lo pasaron genial.', 8, '2026-06-08 16:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', (SELECT id FROM eventos WHERE titulo = 'Indie Rock Night'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'El lugar es pequeño pero tiene buena acústica. Volvería.', 15, '2026-06-09 10:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', (SELECT id FROM eventos WHERE titulo = 'Techno Underground'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Demasiado ruido, no se podía conversar. No es para mí.', 2, '2026-06-10 11:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', (SELECT id FROM eventos WHERE titulo = 'Rock Clásico Chileno'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Nostalgia pura, tocaron todos los clásicos. Emocionante.', 25, '2026-06-11 13:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', (SELECT id FROM eventos WHERE titulo = 'Rock en el Parque'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'El sonido falló un poco al principio, pero después todo perfecto.', 10, '2026-06-12 15:00:00'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', (SELECT id FROM eventos WHERE titulo = 'Festival Electrónico Conce'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Muy caro para lo que ofrecieron. Esperaba más.', 5, '2026-06-13 17:00:00');

-- Likes (15+ likes distribuidos)
INSERT INTO likes (user_id, comentario_id) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07');

-- Encuestas (1 staff, 1 comunidad)
INSERT INTO encuestas (id, tipo, pregunta, evento_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'staff', '¿Qué género musical prefieres para el próximo festival?', (SELECT id FROM eventos WHERE titulo = 'Rock en el Parque'));

INSERT INTO encuesta_opciones (id, encuesta_id, texto, votos) VALUES
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Rock', 15),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Electrónica', 12),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Pop', 8),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Jazz', 5);

-- Encuesta de comunidad (vinculada a un comentario)
INSERT INTO comentarios (id, evento_id, autor_id, contenido, score, created_at) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM eventos WHERE titulo = 'Festival Electrónico Conce'), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '¿A qué DJ les gustaría ver en el próximo evento?', 6, '2026-06-14 10:00:00');

INSERT INTO encuestas (id, tipo, pregunta, evento_id, comentario_id) VALUES
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'comunidad', '¿A qué DJ les gustaría ver?', (SELECT id FROM eventos WHERE titulo = 'Festival Electrónico Conce'), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO encuesta_opciones (id, encuesta_id, texto, votos) VALUES
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Carl Cox', 3),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Adam Beyer', 2),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Nina Kraviz', 1);

-- Votos de encuesta
INSERT INTO encuesta_votos (user_id, opcion_id) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
