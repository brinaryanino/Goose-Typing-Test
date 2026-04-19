export const LANGUAGES = {
  english: [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
    "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "breath", "dream", "thought", "memory", "voice", "word", "song", "music", "dance", "play", "run", "jump", "walk", "climb", "swim", "fly", "fall", "rise", "grow", "change",
    "learn", "read", "write", "speak", "listen", "watch", "hear", "smell", "taste", "feel", "touch", "love", "hate", "fear", "joy", "sad", "angry", "calm", "wild", "free"
  ],
  indonesian: [
    "yang", "di", "dan", "ia", "untuk", "pada", "ke", "itu", "dengan", "dia", "adalah", "ini", "sebagai", "dari", "dalam", "bisa", "tidak", "ada", "saya", "kita",
    "mereka", "anda", "saya", "telah", "oleh", "saat", "akan", "sangat", "lebih", "tapi", "hanya", "bagi", "jika", "juga", "atau", "sebuah", "banyak", "siapa", "mengapa", "bagaimana",
    "kapan", "dimana", "mana", "kata", "tahu", "lihat", "buat", "nama", "orang", "hari", "waktu", "jalan", "datang", "pergi", "makan", "minum", "tidur", "kerja", "belajar", "baca",
    "tulis", "bicara", "dengar", "rasa", "hati", "cinta", "takut", "senang", "sedih", "marah", "tenang", "bebas", "baru", "lama", "besar", "kecil", "tinggi", "rendah", "cepat", "lambat",
    "bumi", "dunia", "laut", "gunung", "sungai", "hutan", "pulau", "planet", "bintang", "bulan", "matahari", "awan", "hujan", "salju", "angin", "badai", "api", "es", "batu", "cahaya"
  ]
};

export type LanguageType = keyof typeof LANGUAGES;

export const getRandomWords = (count: number, lang: LanguageType = "english") => {
  const words = LANGUAGES[lang];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result;
};
