import type { Product, ProductCategory } from './types'

export const staticCategories: ProductCategory[] = [
  { name: 'Все', slug: 'all' },
  { name: 'AQUA+', slug: 'aqua' },
]

export const staticProducts: Product[] = [
  {
    id: 'static-1',
    name: 'Dumbrush',
    price: 5000,
    description:
      'Представим, что мы на пенной вечеринке, выжженной хлоркой. Там есть динозавр, который плюется мыльными пузырями. Рядом тусит тип в костюме коробки и крабоид, который шарит за движ.',
    images: [
      '/images/Test cart 1 cart.jpg',
      '/images/Test cart 1 (2).jpg',
      '/images/Test cart 1 (1).jpg',
      '/images/Test cart 1 (5).jpg',
      '/images/Test cart 1 (4).jpg',
      '/images/Test cart 1 (3).jpg',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [],
    stock: 10,
    active: true,
    category: 'aqua',
    product_type: 'T-Shirt',
    created_at: '',
  },
  {
    id: 'static-2',
    name: 'Dredd Dolphin',
    price: 5000,
    description:
      'Не нанесение. Это след от реакции хлорки которая лишила ткань красителя. Мы не рисуем, а воруем цвет, оставляя прожжённые пятна. Из этих пятен мы собрали историю.',
    images: [
      '/images/Test cart 2 (1).png',
      '/images/Test cart 2 (2).png',
      '/images/Test cart 2 (3).png',
      '/images/Test cart 2 (4).png',
      '/images/Test cart 2 (5).png',
      '/images/Test cart 2 (6).png',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [],
    stock: 10,
    active: true,
    category: 'aqua',
    product_type: 'T-Shirt',
    created_at: '',
  },
  {
    id: 'static-3',
    name: 'Mouse Deathtrap',
    price: 5000,
    description:
      'Хлор не красит ткань. Он её обесцвечивает, выжигая историю прямо из волокон. Так появился принт Mouse Deathtrap — мрачная сказка на ночь.',
    images: [
      '/images/Test cart 2 (7).png',
      '/images/Test cart 2 (8).png',
      '/images/Test cart 1 (9).png',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [],
    stock: 10,
    active: true,
    category: 'aqua',
    product_type: 'T-Shirt',
    created_at: '',
  },
]
