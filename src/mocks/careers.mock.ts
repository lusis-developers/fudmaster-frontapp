export type MockCareer = {
  _id: string
  name: string
  description: string
  imageUrl: string
  courseIds: string[]
  isActive: boolean
}

const images: string[] = [
  'https://uploads.teachablecdn.com/attachments/f918edff8a32404da3f15661db0dd920.jpg',
  'https://uploads.teachablecdn.com/attachments/089997c835684f7f8cb2b94bd73e4320.png',
  'https://uploads.teachablecdn.com/attachments/450b1cd9d0494b508310ae8a834384c0.png',
]

const titles: string[] = [
  'Escuela de Costos y Finanzas Gastronómicas',
  'Escuela de Marketing Gastronómico',
  'Escuela de Operación de Cocina y Dark Kitchen',
  'Escuela de Humanización de Marca y Servicio',
]

export function makeCareerPlaceholders(count = 4): MockCareer[] {
  const n = Math.max(0, Number(count) || 0)
  return Array.from({ length: n }, (_, i) => ({
    _id: `mock-${i + 1}`,
    name: String(titles[i % titles.length] || `Carrera ${i + 1}`),
    description: 'Disponible próximamente',
    imageUrl: String(images[i % images.length] || images[0]),
    courseIds: [],
    isActive: false,
  }))
}
