/** Indonesian lesson text for the "Puncak Naga" (advanced) zone. */
export const translations = {
  manyRebases: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Rebase Banyak Cabang',
              '',
              'Wah, cabangnya banyak sekali di sini! Tugas kita: memindahkan semua pekerjaan dari cabang-cabang itu ke atas `main`.',
              '',
              'Tapi ada syarat tambahan yang bikin susah: commit-nya harus **berurutan rapi**. Jadi di pohon akhir nanti, `C7\'` ada di paling bawah, `C6\'` di atasnya, begitu seterusnya sesuai urutan.',
              '',
              'Satu tips berguna: `git rebase` bisa menerima argumen kedua. `git rebase main bugFix` artinya pindah ke `bugFix` lalu rebase ke `main`, sekali jalan. Itu jalan pintas dari `git checkout bugFix; git rebase main`.',
              '',
              'Kalau kamu salah di tengah jalan, santai saja, pakai tombol **Ulangi level** untuk mulai lagi. Coba juga cari cara dengan perintah sesedikit mungkin!',
            ],
          },
        },
      ],
    },
  },

  multipleParents: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Memilih Orang Tua',
              '',
              'Sama seperti `~`, tanda `^` juga bisa diberi angka di belakangnya.',
              '',
              'Tapi artinya beda! Angka di `~` berarti "naik berapa langkah". Angka di `^` berarti **"lewat orang tua yang mana"**.',
              '',
              'Ingat, commit hasil merge punya dua orang tua. Jadi kalau kamu naik dari situ, Git bingung mau lewat jalan yang mana.',
              '',
              'Biasanya Git otomatis lewat orang tua **pertama**. Dengan menulis angka di `^`, kamu bisa menyuruhnya lewat jalan yang lain.',
              '',
              'Sudah cukup ngobrolnya, ayo lihat langsung.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ini ada commit hasil merge. Kalau kita `main^` tanpa angka, kita akan lewat orang tua yang pertama.',
              '',
              '(*Di gambar kita, orang tua pertama letaknya tepat di atas commit merge.*)',
            ],
            afterMarkdowns: ['Gampang -- ini yang sudah biasa kita pakai.'],
            command: 'git checkout main^',
            beforeCommand: 'git checkout HEAD^; git commit; git checkout main; git merge C2',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Sekarang coba kita minta orang tua yang **kedua**...'],
            afterMarkdowns: ['Lihat kan? Kita naik lewat jalan yang satunya.'],
            command: 'git checkout main^2',
            beforeCommand: 'git checkout HEAD^; git commit; git checkout main; git merge C2',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Kalau digabung, `^` dan `~` bikin kamu bisa melesat ke mana saja di pohon commit:',
            ],
            afterMarkdowns: ['Secepat kilat!'],
            command: 'git checkout HEAD~; git checkout HEAD^2; git checkout HEAD~2',
            beforeCommand:
              'git commit; git checkout C0; git commit; git commit; git commit; git checkout main; git merge C5; git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Lebih gila lagi: semuanya bisa dirangkai jadi satu! Lihat ini:'],
            afterMarkdowns: ['Perpindahan yang sama persis seperti tadi, tapi cukup satu perintah.'],
            command: 'git checkout HEAD~^2~2',
            beforeCommand:
              'git commit; git checkout C0; git commit; git commit; git commit; git checkout main; git merge C5; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Misi kamu',
              '',
              'Buat cabang baru di tempat yang ditunjukkan target.',
              '',
              'Sebenarnya gampang saja kalau kamu menyebut nama commit-nya langsung (misalnya `C6`). Tapi aku tantang kamu memakai tanda `^` dan `~` yang barusan kita pelajari!',
            ],
          },
        },
      ],
    },
  },

  selectiveRebase: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Cabang Mie Kusut',
              '',
              'Waaah, targetnya lumayan berat di level ini!',
              '',
              'Di sini `main` sudah beberapa langkah di depan cabang `one`, `two`, dan `three`. Tugas kita: mengisi ketiga cabang itu dengan versi ubahan dari beberapa commit terakhir di `main`.',
              '',
              'Rinciannya begini:',
              '',
              '* Cabang `one` butuh commit-nya **diacak urutannya**, dan `C5` harus **dibuang**',
              '* Cabang `two` cuma butuh urutannya diubah saja',
              '* Cabang `three` cuma butuh **satu** commit dipindahkan',
              '',
              'Silakan pikirkan sendiri caranya ya! Ingat, kerjakan berurutan: `one` dulu, lalu `two`, baru `three`.',
            ],
          },
        },
      ],
    },
  },
};
