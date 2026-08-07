import { Scissors, Hand, Eye, Wind, Sparkles, LayoutGrid, Paintbrush, Droplets, Flower2 } from 'lucide-react';

// Categorías visibles en el filtro (selector horizontal)
export const categories = [
  { key: 'all', label: 'Todos', icon: LayoutGrid },
  { key: 'hair', label: 'Cabello', icon: Scissors },
  { key: 'nails', label: 'Uñas', icon: Hand },
  { key: 'eyelashes', label: 'Pestañas', icon: Eye },
  { key: 'hairstyle', label: 'Peinados', icon: Sparkles },
  { key: 'smoothing', label: 'Alisados', icon: Wind },
  { key: 'cuts', label: 'Cortes', icon: Scissors }
];

// Categorías opcionales, preparadas para agregarse después
export const optionalCategories = [
  { key: 'makeup', label: 'Maquillaje', icon: Paintbrush },
  { key: 'facial', label: 'Faciales', icon: Droplets },
  { key: 'spa', label: 'Spa', icon: Flower2 }
];

// Servicios destacados (MOCK DATA — no conectar backend todavía)
// Las imágenes son tus fotos locales en /public/images/services/.
// Pega cada foto real del salón con estos nombres exactos:
//   balayage.jpg, unas-acrilicas.jpg, semipermanente.jpg,
//   pestanas.jpg, peinado.jpg, alisado.jpg, corte.jpg
export const featuredServices = [
  {
    id: 1,
    category: 'hair',
    name: 'Balayage Premium',
    description: 'Color personalizado para iluminar y realzar tu cabello.',
    duration: '2–4 horas',
    price: 280000,
    image: '/images/services/balayage.webp'
  },
  {
    id: 2,
    category: 'nails',
    name: 'Uñas acrílicas',
    description: 'Diseño resistente y elegante con acabado esmaltado.',
    duration: '2 horas',
    price: 120000,
    image: '/images/services/unas-acrilicas.webp'
  },
  {
    id: 3,
    category: 'nails',
    name: 'Semipermanente',
    description: 'Color lustroso que dura semanas, listo para el día a día.',
    duration: '1 hora',
    price: 75000,
    image: '/images/services/semipermanente.webp'
  },
  {
    id: 4,
    category: 'eyelashes',
    name: 'Extensiones de pestañas',
    description: 'Mirada amplia y natural con resultado de volumen elegante.',
    duration: '1.5 horas',
    price: 90000,
    image: '/images/services/pestanas.png'
  },
  {
    id: 5,
    category: 'hairstyle',
    name: 'Peinado profesional',
    description: 'Recogidos u ondas con acabado profesional para eventos.',
    duration: '1–2 horas',
    price: 65000,
    image: '/images/services/peinado.png'
  },
  {
    id: 6,
    category: 'smoothing',
    name: 'Alisado completo',
    description: 'Cabello largo, liso y brillante con resultado premium.',
    duration: '3 horas',
    price: 350000,
    image: '/images/services/alisado.png'
  },
  {
    id: 7,
    category: 'cuts',
    name: 'Corte femenino',
    description: 'Un corte profesional que realza tu rostro y personalidad.',
    duration: '1 hora',
    price: 80000,
    image: '/images/services/corte.png'
  }
];