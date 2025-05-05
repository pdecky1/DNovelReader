
import { Novel, Genre, Chapter } from "../types";

// Mock genres
export const mockgenres: Genre[] = [
  { id: "1", name: "Fantasy" },
  { id: "2", name: "Science Fiction" },
  { id: "3", name: "Romance" },
  { id: "4", name: "Mystery" },
  { id: "5", name: "Horror" },
  { id: "6", name: "Adventure" },
  { id: "7", name: "Historical" },
];

// Mock novels
export const mockNovels: Novel[] = [
  {
    id: "1",
    title: "The Crystal Kingdom",
    description: "A young mage discovers her powers in a world where magic is forbidden.",
    imageUrl: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb",
    genres: [mockgenres[0], mockgenres[5]],
    createdAt: new Date(2023, 5, 12).toISOString(),
    updatedAt: new Date(2023, 6, 14).toISOString(),
  },
  {
    id: "2",
    title: "Starship Odyssey",
    description: "The last survivors of Earth embark on a journey to find a new home.",
    imageUrl: "https://images.unsplash.com/photo-1501862700950-18382cd41497",
    genres: [mockgenres[1], mockgenres[5]],
    createdAt: new Date(2023, 3, 22).toISOString(),
    updatedAt: new Date(2023, 4, 30).toISOString(),
  },
  {
    id: "3",
    title: "Midnight Detective",
    description: "A detective with unusual methods solves crimes in a corrupt city.",
    imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
    genres: [mockgenres[3]],
    createdAt: new Date(2023, 1, 5).toISOString(),
    updatedAt: new Date(2023, 2, 15).toISOString(),
  },
  {
    id: "4",
    title: "Love in Paris",
    description: "Two strangers meet in Paris and their lives are changed forever.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    genres: [mockgenres[2], mockgenres[6]],
    createdAt: new Date(2023, 7, 19).toISOString(),
    updatedAt: new Date(2023, 8, 2).toISOString(),
  },
];

// Mock chapters
export const mockChapters: Chapter[] = [
  {
    id: "1",
    novelId: "1",
    title: "The Beginning",
    content: "In a world where magic flowed like water, young Elara discovered her powers at the age of twelve. It was during the Festival of Lights, when the entire village gathered to celebrate the annual return of the glowing crystal butterflies. Elara had been watching in awe as the luminescent creatures danced across the night sky, their wings painting trails of blue and purple light. Without warning, she felt a strange tingling in her fingertips. As she raised her hand in wonder, a small spark jumped between her fingers, catching the attention of a nearby elder. The old man's eyes widened in fear, and Elara knew in that moment that her life would never be the same...",
    order: 1,
    createdAt: new Date(2023, 5, 12).toISOString(),
    updatedAt: new Date(2023, 5, 12).toISOString(),
  },
  {
    id: "2",
    novelId: "1",
    title: "The Discovery",
    content: "\"You must hide this gift,\" the elder whispered urgently, pulling Elara away from the crowd. \"Magic has been forbidden in the kingdom for decades.\" That night, Elara learned the dark history of her homeland. The last Mage King had nearly destroyed the realm in his quest for immortality, and in the aftermath, all forms of magic were outlawed. Those discovered with magical abilities were taken away, never to be seen again. But the elder saw something in Elara—a pureness of heart that might be their salvation. He offered to teach her in secret, to help her control her powers and perhaps, one day, restore the balance that had been lost. With trembling hands but resolute spirit, Elara agreed to his proposal, beginning a journey that would challenge everything she thought she knew about her world and herself...",
    order: 2,
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 5, 15).toISOString(),
  },
  {
    id: "3",
    novelId: "1",
    title: "The Training",
    content: "For months, Elara met with the elder, whose name she learned was Thorne, in a hidden cave beneath the ancient oak tree at the edge of the village. The training was grueling. Magic, Thorne explained, wasn't just about power—it was about balance, control, and intention. \"Your mind must be as calm as still water,\" he would say, \"and your heart as steady as the mountain.\" Elara spent hours in meditation, connecting with the energy that flowed through all living things. She learned to channel this energy, to shape it with her will. Fire was her first element—unpredictable and fierce, just like her spirit. Water came next, teaching her flexibility and persistence. Earth grounded her, while air reminded her of freedom. But the true test came when Thorne asked her to combine them all. \"Magic is not separate elements,\" he said. \"It is the harmony between them.\" As Elara closed her eyes and extended her hands, she felt the elements dancing around her fingers, responding to her call. For the first time, she wasn't afraid of her gift—she embraced it...",
    order: 3,
    createdAt: new Date(2023, 5, 20).toISOString(),
    updatedAt: new Date(2023, 5, 20).toISOString(),
  },
  {
    id: "4",
    novelId: "2",
    title: "Launch Day",
    content: "The countdown echoed through the massive launch facility, each number bringing humanity closer to its most desperate gamble. Captain Sarah Chen stood on the bridge of the Starship Odyssey, her eyes fixed on the viewscreen showing Earth—their beautiful, dying home. The final five hundred thousand people selected for the journey were already in cryosleep, dreams their only escape from the reality of leaving everything behind. \"One minute to launch,\" announced the ship's AI, its voice eerily calm for such a momentous occasion. Sarah's mind flashed to the riots that had broken out when the Colony Ship Lottery results were announced, the desperate faces of those left behind. She pushed the thoughts away. There was no room for doubt now. \"Initiate final launch sequence,\" she ordered, her voice steady despite the weight of three billion lives pressing down on her shoulders. The Odyssey's engines roared to life, vibrating through the massive vessel as it prepared to carry the last remnants of humanity into the stars...",
    order: 1,
    createdAt: new Date(2023, 3, 22).toISOString(),
    updatedAt: new Date(2023, 3, 22).toISOString(),
  },
];
