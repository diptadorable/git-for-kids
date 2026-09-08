/**
 * UI strings in Bahasa Indonesia and English.
 *
 * Indonesian is the default: the game is built for an Indonesian primary
 * school player. Git command names themselves are never translated -- the
 * player has to type the real thing.
 */

export type Lang = 'id' | 'en';
export const LANGS: Lang[] = ['id', 'en'];
export const DEFAULT_LANG: Lang = 'id';

export const LANG_LABEL: Record<Lang, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

export const strings = {
  // --- chrome -------------------------------------------------------------
  appName: { id: 'Petualangan Git', en: 'Git Adventure' },
  tagline: {
    id: 'Belajar Git sambil bertualang',
    en: 'Learn Git on an adventure',
  },

  // --- map ----------------------------------------------------------------
  worldMap: { id: 'Peta Dunia', en: 'World Map' },
  continue: { id: 'Lanjutkan', en: 'Continue' },
  levelsDone: { id: 'level selesai', en: 'levels done' },
  locked: { id: 'Terkunci', en: 'Locked' },
  lockedHint: {
    id: 'Selesaikan level sebelumnya dulu ya!',
    en: 'Finish the level before this one first!',
  },
  replay: { id: 'Main lagi', en: 'Replay' },
  start: { id: 'Mulai', en: 'Start' },

  // --- play screen --------------------------------------------------------
  yourRepo: { id: 'Repo Kamu', en: 'Your Repo' },
  goal: { id: 'Target', en: 'Goal' },
  showGoal: { id: 'Lihat target', en: 'Show goal' },
  hideGoal: { id: 'Sembunyikan target', en: 'Hide goal' },
  hint: { id: 'Petunjuk', en: 'Hint' },
  showHint: { id: 'Minta petunjuk', en: 'Ask for a hint' },
  reset: { id: 'Ulangi level', en: 'Reset level' },
  undo: { id: 'Kembali', en: 'Undo' },
  typeCommand: {
    id: 'Ketik perintah git di sini...',
    en: 'Type a git command here...',
  },
  levelComplete: { id: 'Level Selesai!', en: 'Level Complete!' },
  nextLevel: { id: 'Level Berikutnya', en: 'Next Level' },
  backToMap: { id: 'Kembali ke Peta', en: 'Back to Map' },
  commandsUsed: { id: 'perintah dipakai', en: 'commands used' },
  bestSolution: { id: 'Solusi terbaik', en: 'Best solution' },
  objective: { id: 'Misi', en: 'Objective' },

  // --- interactive rebase -------------------------------------------------
  rebaseTitle: { id: 'Susun Ulang Commit', en: 'Reorder Commits' },
  rebaseHelp: {
    id: 'Seret untuk mengurutkan. Klik untuk membuang commit.',
    en: 'Drag to reorder. Click to drop a commit.',
  },
  rebaseConfirm: { id: 'Jalankan', en: 'Run it' },
  rebaseCancel: { id: 'Batal', en: 'Cancel' },
  dropped: { id: 'dibuang', en: 'dropped' },

  // --- auth ---------------------------------------------------------------
  signIn: { id: 'Masuk', en: 'Sign in' },
  signUp: { id: 'Daftar', en: 'Sign up' },
  signOut: { id: 'Keluar', en: 'Sign out' },
  email: { id: 'Email', en: 'Email' },
  password: { id: 'Kata sandi', en: 'Password' },
  displayName: { id: 'Nama panggilan', en: 'Nickname' },
  createAccount: { id: 'Buat akun baru', en: 'Create an account' },
  haveAccount: { id: 'Sudah punya akun?', en: 'Already have an account?' },
  noAccount: { id: 'Belum punya akun?', en: 'No account yet?' },
  signingIn: { id: 'Sedang masuk...', en: 'Signing in...' },
  authFailed: {
    id: 'Email atau kata sandi salah.',
    en: 'Wrong email or password.',
  },
  emailTaken: {
    id: 'Email ini sudah dipakai.',
    en: 'That email is already taken.',
  },
  passwordTooShort: {
    id: 'Kata sandi minimal 8 huruf.',
    en: 'Password must be at least 8 characters.',
  },
  progressSaved: { id: 'Progres tersimpan', en: 'Progress saved' },
  savingProgress: { id: 'Menyimpan...', en: 'Saving...' },
  saveFailed: {
    id: 'Gagal menyimpan -- progres disimpan di perangkat ini.',
    en: 'Could not save online -- progress kept on this device.',
  },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Lang): string {
  return strings[key][lang] ?? strings[key].en;
}

/** Sequence titles, matching learnGitBranching's grouping. */
export const SEQUENCE_INFO: Record<
  string,
  { name: Record<Lang, string>; about: Record<Lang, string> }
> = {
  intro: {
    name: { id: 'Desa Awal', en: 'Starter Village' },
    about: {
      id: 'Perkenalan santai ke sebagian besar perintah git.',
      en: 'A nicely paced introduction to the majority of git commands.',
    },
  },
  rampup: {
    name: { id: 'Hutan Cabang', en: 'Branching Forest' },
    about: {
      id: 'Hidangan berikutnya. Semoga kamu lapar!',
      en: "The next serving of git awesomeness. Hope you're hungry.",
    },
  },
  move: {
    name: { id: 'Tambang Pemindah', en: 'The Moving Mines' },
    about: {
      id: 'Pindahkan commit dan pilih perubahan mana yang ikut.',
      en: 'Move commits around and choose which changes belong together.',
    },
  },
  mixed: {
    name: { id: 'Pasar Campur', en: 'The Mixed Bazaar' },
    about: {
      id: 'Aneka teknik, trik, dan tips Git.',
      en: 'A mixed bag of Git techniques, tricks, and tips.',
    },
  },
  advanced: {
    name: { id: 'Puncak Naga', en: 'Dragon Peak' },
    about: {
      id: 'Hanya untuk yang benar-benar berani!',
      en: 'For the truly brave!',
    },
  },
  remote: {
    name: { id: 'Pelabuhan Jauh', en: 'Far Harbor' },
    about: {
      id: 'Saatnya berbagi kode -- ngoding jadi ramai!',
      en: "Time to share your 1's and 0's; coding just got social.",
    },
  },
  remoteAdvanced: {
    name: { id: 'Benteng Origin', en: 'Origin Fortress' },
    about: {
      id: 'Dan kamu kira jadi penguasa itu menyenangkan...',
      en: 'And you thought being a benevolent dictator would be fun...',
    },
  },
};
