const generateDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(18 + Math.floor(Math.random() * 4), 0, 0, 0);
  return date.toISOString();
};

const comunas = ['Concepción', 'Hualpén', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Penco', 'Tomé'];
const generos = ['rock', 'pop', 'electronica', 'jazz', 'otro'];
const acessos = ['gratis', 'pago'];
const lugares = ['Estadio Municipal', 'Centro Cultural', 'Plaza Perú', 'Museo de Historia', 'Parque Ecuador', 'Casonaspark', 'Sala de Conciertos UdeC', 'Teatro Municipal', 'Bar El转.', 'Centro Cívico'];

const mockEvents = [
  { id: 1, titulo: 'Noche de Rock Local', imagen_url: 'https://picsum.photos/seed/rock1/400/300', comuna: 'Concepción', fecha_inicio: generateDate(2), acceso: 'gratis', genero: 'rock', lugar: 'Estadio Municipal' },
  { id: 2, titulo: 'Festival de Electrónica', imagen_url: 'https://picsum.photos/seed/electro1/400/300', comuna: 'Talcahuano', fecha_inicio: generateDate(3), acceso: 'pago', genero: 'electronica', lugar: 'Centro Cultural' },
  { id: 3, titulo: 'Jazz en el Parque', imagen_url: 'https://picsum.photos/seed/jazz1/400/300', comuna: 'Concepción', fecha_inicio: generateDate(4), acceso: 'gratis', genero: 'jazz', lugar: 'Parque Ecuador' },
  { id: 4, titulo: 'Pop Latino Night', imagen_url: 'https://picsum.photos/seed/pop1/400/300', comuna: 'Hualpén', fecha_inicio: generateDate(5), acceso: 'pago', genero: 'pop', lugar: 'Sala de Conciertos UdeC' },
  { id: 5, titulo: 'Rock Alternativo', imagen_url: 'https://picsum.photos/seed/rock2/400/300', comuna: 'San Pedro de la Paz', fecha_inicio: generateDate(6), acceso: 'gratis', genero: 'rock', lugar: 'Casonaspark' },
  { id: 6, titulo: 'Electrónica Experimental', imagen_url: 'https://picsum.photos/seed/electro2/400/300', comuna: 'Concepción', fecha_inicio: generateDate(7), acceso: 'pago', genero: 'electronica', lugar: 'Bar El转.' },
  { id: 7, titulo: 'Swing & Jazz', imagen_url: 'https://picsum.photos/seed/jazz2/400/300', comuna: 'Talcahuano', fecha_inicio: generateDate(8), acceso: 'gratis', genero: 'jazz', lugar: 'Teatro Municipal' },
  { id: 8, titulo: 'Pop Acústico', imagen_url: 'https://picsum.photos/seed/pop2/400/300', comuna: 'Chiguayante', fecha_inicio: generateDate(9), acceso: 'gratis', genero: 'pop', lugar: 'Plaza Perú' },
  { id: 9, titulo: 'Metal Fest Local', imagen_url: 'https://picsum.photos/seed/rock3/400/300', comuna: 'Concepción', fecha_inicio: generateDate(10), acceso: 'pago', genero: 'rock', lugar: 'Centro Cultural' },
  { id: 10, titulo: 'TechnoSession', imagen_url: 'https://picsum.photos/seed/electro3/400/300', comuna: 'Hualpén', fecha_inicio: generateDate(11), acceso: 'pago', genero: 'electronica', lugar: 'Centro Cívico' },
  { id: 11, titulo: 'Folk Night', imagen_url: 'https://picsum.photos/seed/folk1/400/300', comuna: 'Penco', fecha_inicio: generateDate(12), acceso: 'gratis', genero: 'otro', lugar: 'Museo de Historia' },
  { id: 12, titulo: 'Indie Rock Encounter', imagen_url: 'https://picsum.photos/seed/rock4/400/300', comuna: 'Tomé', fecha_inicio: generateDate(13), acceso: 'gratis', genero: 'rock', lugar: 'Estadio Municipal' },
  { id: 13, titulo: 'EDM Festival', imagen_url: 'https://picsum.photos/seed/edm1/400/300', comuna: 'Talcahuano', fecha_inicio: generateDate(14), acceso: 'pago', genero: 'electronica', lugar: 'Centro Cultural' },
  { id: 14, titulo: 'Bossanova Live', imagen_url: 'https://picsum.photos/seed/jazz3/400/300', comuna: 'Concepción', fecha_inicio: generateDate(15), acceso: 'pago', genero: 'jazz', lugar: 'Sala de Conciertos UdeC' },
  { id: 15, titulo: 'K-Pop Cover Night', imagen_url: 'https://picsum.photos/seed/kpop1/400/300', comuna: 'San Pedro de la Paz', fecha_inicio: generateDate(16), acceso: 'pago', genero: 'pop', lugar: 'Casonaspark' },
  { id: 16, titulo: 'Punk Rock Rebellion', imagen_url: 'https://picsum.photos/seed/punk1/400/300', comuna: 'Hualpén', fecha_inicio: generateDate(17), acceso: 'gratis', genero: 'rock', lugar: 'Bar El转.' },
  { id: 17, titulo: 'Chillwave Sessions', imagen_url: 'https://picsum.photos/seed/chill1/400/300', comuna: 'Concepción', fecha_inicio: generateDate(18), acceso: 'gratis', genero: 'electronica', lugar: 'Parque Ecuador' },
  { id: 18, titulo: 'Reggaeton Fest', imagen_url: 'https://picsum.photos/seed/regga1/400/300', comuna: 'Talcahuano', fecha_inicio: generateDate(19), acceso: 'pago', genero: 'pop', lugar: 'Teatro Municipal' },
  { id: 19, titulo: 'Blues Brothers Tribute', imagen_url: 'https://picsum.photos/seed/blues1/400/300', comuna: 'Chiguayante', fecha_inicio: generateDate(20), acceso: 'gratis', genero: 'jazz', lugar: 'Plaza Perú' },
  { id: 20, titulo: 'Hip Hop Underground', imagen_url: 'https://picsum.photos/seed/hiphop1/400/300', comuna: 'Penco', fecha_inicio: generateDate(21), acceso: 'gratis', genero: 'otro', lugar: 'Centro Cultural' },
  { id: 21, titulo: 'Shoegaze Dreams', imagen_url: 'https://picsum.photos/seed/shoe1/400/300', comuna: 'Tomé', fecha_inicio: generateDate(22), acceso: 'pago', genero: 'rock', lugar: 'Museo de Historia' },
  { id: 22, titulo: 'Deep House Party', imagen_url: 'https://picsum.photos/seed/deep1/400/300', comuna: 'Concepción', fecha_inicio: generateDate(23), acceso: 'pago', genero: 'electronica', lugar: 'Centro Cívico' },
  { id: 23, titulo: 'Cumbia Total', imagen_url: 'https://picsum.photos/seed/cumbia1/400/300', comuna: 'Hualpén', fecha_inicio: generateDate(24), acceso: 'gratis', genero: 'otro', lugar: 'Estadio Municipal' },
  { id: 24, titulo: 'Soul Music Night', imagen_url: 'https://picsum.photos/seed/soul1/400/300', comuna: 'San Pedro de la Paz', fecha_inicio: generateDate(25), acceso: 'pago', genero: 'jazz', lugar: 'Sala de Conciertos UdeC' },
  { id: 25, titulo: 'Pop Internacional', imagen_url: 'https://picsum.photos/seed/pop3/400/300', comuna: 'Talcahuano', fecha_inicio: generateDate(26), acceso: 'pago', genero: 'pop', lugar: 'Casonaspark' },
  { id: 26, titulo: 'Garage Rock Revival', imagen_url: 'https://picsum.photos/seed/garage1/400/300', comuna: 'Concepción', fecha_inicio: generateDate(27), acceso: 'gratis', genero: 'rock', lugar: 'Bar El转.' },
  { id: 27, titulo: 'Ambient Soundscape', imagen_url: 'https://picsum.photos/seed/ambient1/400/300', comuna: 'Chiguayante', fecha_inicio: generateDate(28), acceso: 'gratis', genero: 'electronica', lugar: 'Parque Ecuador' },
  { id: 28, titulo: 'Tango Nuevo', imagen_url: 'https://picsum.photos/seed/tango1/400/300', comuna: 'Penco', fecha_inicio: generateDate(29), acceso: 'pago', genero: 'otro', lugar: 'Teatro Municipal' },
  { id: 29, titulo: 'New Wave 80s', imagen_url: 'https://picsum.photos/seed/newwave1/400/300', comuna: 'Tomé', fecha_inicio: generateDate(30), acceso: 'pago', genero: 'pop', lugar: 'Plaza Perú' },
];

export default mockEvents;
