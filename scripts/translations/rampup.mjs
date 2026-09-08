/** Indonesian lesson text for the "Hutan Cabang" (rampup) zone. */
export const translations = {
  detachedHead: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Jalan-jalan di dalam Git',
              '',
              'Sebelum belajar jurus-jurus Git yang lebih sakti, kamu harus bisa **berpindah-pindah** dulu di antara commit.',
              '',
              'Kalau kamu sudah lancar berpindah, semua perintah Git lainnya jadi terasa jauh lebih gampang!',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Apa itu HEAD?',
              '',
              'HEAD itu seperti **tanda "kamu di sini"** di peta. Dia menunjuk commit mana yang sedang kamu tempati sekarang.',
              '',
              'Biasanya HEAD tidak menempel langsung ke commit, tapi menempel ke sebuah cabang (misalnya `bugFix`). Jadi kalau kamu commit, cabangnya yang maju, dan HEAD ikut terbawa.',
              '',
              'Anggap saja HEAD itu kamu, dan cabang itu perahu yang kamu naiki.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ayo kita intip. Di sini HEAD akan kita tampakkan sebelum dan sesudah commit.',
            ],
            afterMarkdowns: [
              'Nah! Ternyata HEAD dari tadi memang sedang bersembunyi di balik cabang `main`.',
            ],
            command: 'git checkout C1; git checkout main; git commit; git checkout C2',
            beforeCommand: '',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              '### Melepas HEAD',
              '',
              'Melepas HEAD artinya menempelkan HEAD langsung ke sebuah commit, bukan ke cabang. Kamu turun dari perahu dan berdiri di daratan.',
              '',
              'Sebelumnya begini:',
              '',
              'HEAD -> main -> C1',
            ],
            afterMarkdowns: ['Sekarang jadi begini:', '', 'HEAD -> C1'],
            command: 'git checkout C1',
            beforeCommand: '',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Lepaskan HEAD dari `bugFix`, lalu tempelkan langsung ke commit-nya.',
              '',
              'Sebutkan commit itu pakai namanya. Nama tiap commit tertulis di dalam lingkarannya.',
            ],
          },
        },
      ],
    },
  },

  relativeRefs: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Alamat Singkat',
              '',
              'Menyebut commit satu per satu pakai namanya lama-lama capek juga. Di dunia nyata kamu tidak punya gambar cantik seperti ini di sebelah layar.',
              '',
              'Nama commit asli juga panjang banget. Contohnya `fed2da64c0efc5293610bdd892f82a58e8cbc5d8`. Panjang sekali kan?',
              '',
              'Untungnya Git pintar. Kamu cukup mengetik beberapa huruf pertama saja, misalnya `fed2`, asal tidak ada commit lain yang mirip.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Tetap saja itu merepotkan. Makanya Git punya **alamat singkat**. Ini keren banget!',
              '',
              'Idenya: mulai dari tempat yang gampang diingat (misalnya cabang `bugFix` atau `HEAD`), lalu hitung mundur dari situ.',
              '',
              'Ada dua yang akan kita pakai:',
              '',
              '* `^` untuk naik **satu** commit',
              '* `~<angka>` untuk naik **beberapa** commit sekaligus',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Kita coba tanda topi (`^`) dulu. Setiap kali kamu menambahkannya, Git akan mencari **induk** dari commit itu.',
              '',
              'Jadi `main^` artinya "induknya `main`".',
              '',
              'Kalau `main^^` artinya kakeknya `main`.',
              '',
              'Ayo pindah ke commit di atas main.',
            ],
            afterMarkdowns: ['Berhasil! Jauh lebih gampang daripada mengetik nama commit-nya.'],
            command: 'git checkout main^',
            beforeCommand: 'git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              '`HEAD` juga bisa dipakai sebagai titik awal. Ayo pakai beberapa kali untuk naik ke atas.',
            ],
            afterMarkdowns: ['Gampang! Kita bisa mundur ke masa lalu pakai `HEAD^`.'],
            command: 'git checkout C3; git checkout HEAD^; git checkout HEAD^; git checkout HEAD^',
            beforeCommand: 'git commit; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Pindah ke commit **induknya** `bugFix`. HEAD kamu akan terlepas.',
              '',
              'Boleh saja pakai nama commit-nya, tapi coba pakai alamat singkat ya!',
            ],
          },
        },
      ],
    },
  },

  relativeRefs2: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Tanda gelombang "~"',
              '',
              'Kalau kamu mau naik banyak sekali, mengetik `^^^^^^` itu melelahkan. Makanya Git punya tanda gelombang (`~`).',
              '',
              'Di belakang `~` kamu bisa menulis angka: berapa langkah yang mau kamu naiki. Ayo lihat contohnya.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo naik beberapa commit sekaligus pakai `~`.'],
            afterMarkdowns: ['Mantap! Singkat sekali. Alamat singkat itu memang enak dipakai.'],
            command: 'git checkout HEAD~4',
            beforeCommand: 'git commit; git commit; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Memaksa cabang pindah',
              '',
              'Sekarang kamu sudah jago alamat singkat. Ayo kita pakai untuk sesuatu yang berguna.',
              '',
              'Alamat singkat paling sering dipakai untuk **memindahkan cabang**. Pakai pilihan `-f` untuk menyeret cabang ke commit mana pun:',
              '',
              '`git branch -f main HEAD~3`',
              '',
              'Artinya: paksa cabang `main` pindah ke tiga langkah di atas HEAD.',
              '',
              '*Catatan: di Git sungguhan, `git branch -f` tidak boleh dipakai pada cabang yang sedang kamu tempati.*',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo lihat perintah tadi bekerja.'],
            afterMarkdowns: [
              'Nah! Alamat singkat memberi kita cara pendek untuk menyebut `C1`, dan `-f` memberi kita cara cepat memindahkan cabang ke sana.',
            ],
            command: 'git branch -f main HEAD~3',
            beforeCommand: 'git commit; git commit; git commit; git checkout -b bugFix',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Sekarang gabungkan keduanya: alamat singkat dan memaksa cabang pindah.',
              '',
              'Pindahkan `HEAD`, `main`, dan `bugFix` ke tempat tujuan yang ditunjukkan di target.',
            ],
          },
        },
      ],
    },
  },

  reversingChanges: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Membatalkan Perubahan',
              '',
              'Salah itu wajar! Untungnya Git punya cara membatalkan pekerjaan.',
              '',
              'Ada dua cara utama: `git reset` dan `git revert`. Keduanya membatalkan, tapi caranya beda banget.',
              '',
              'Kita lihat satu per satu di halaman berikutnya.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              '## Git Reset',
              '',
              '`git reset` membatalkan dengan cara **memundurkan** cabang ke commit yang lebih lama.',
              '',
              'Anggap saja seperti menghapus tulisan di papan: setelah itu, seolah-olah commit tadi tidak pernah ada.',
              '',
              'Ayo lihat:',
            ],
            afterMarkdowns: [
              'Sip! Git memundurkan cabang main kembali ke `C1`. Sekarang keadaannya seolah-olah `C2` tidak pernah dibuat.',
            ],
            command: 'git reset HEAD~1',
            beforeCommand: 'git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              '## Git Revert',
              '',
              'Reset enak dipakai kalau pekerjaannya masih di komputermu sendiri. Tapi kalau sudah dibagikan ke teman, menghapus sejarah malah bikin bingung mereka.',
              '',
              'Kalau kamu mau membatalkan **dan** hasil pembatalannya ikut dibagikan, pakai `git revert`. Ayo coba.',
            ],
            afterMarkdowns: [
              'Lho, kok malah muncul commit baru di ujungnya?',
              '',
              'Itu memang sengaja. Commit baru `C2\'` isinya kebalikan dari `C2`. Jadi hasil akhirnya sama-sama batal, tapi sejarahnya tetap utuh dan aman dibagikan ke teman.',
            ],
            command: 'git revert HEAD^',
            beforeCommand: 'git commit; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Batalkan commit terakhir di cabang `local` **dan** di cabang `pushed`. Jadi total dua pembatalan, satu di tiap cabang.',
              '',
              'Ingat: `pushed` itu cabang yang sudah dibagikan, `local` masih milikmu sendiri. Petunjuk itu menentukan cara mana yang kamu pakai untuk masing-masing.',
            ],
          },
        },
      ],
    },
  },
};
