/** Indonesian lesson text for the "Tambang Pemindah" (move) zone. */
export const translations = {
  cherryPick: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Memindahkan Pekerjaan',
              '',
              'Sampai sini kamu sudah bisa commit, bikin cabang, dan jalan-jalan di pohon commit. Bekal itu saja sudah cukup untuk 90% pekerjaan sehari-hari!',
              '',
              'Sisa 10%-nya berguna kalau keadaan mulai ruwet. Sekarang kita belajar **memindahkan pekerjaan**: cara bilang ke Git "yang ini taruh sini, yang itu taruh sana".',
              '',
              'Kedengarannya rumit, padahal gampang kok.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Git Cherry-pick',
              '',
              'Namanya `git cherry-pick`, artinya "memetik ceri". Bentuknya begini:',
              '',
              '* `git cherry-pick <Commit1> <Commit2> <...>`',
              '',
              'Bayangkan pohon penuh buah. Kamu tidak mau semuanya, cuma mau memetik beberapa buah yang paling enak, lalu menaruhnya di keranjangmu.',
              '',
              'Persis begitu: kamu sebut commit mana saja yang kamu mau, dan Git menyalinnya ke bawah posisimu sekarang (`HEAD`).',
              '',
              'Ayo lihat contohnya!',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ini gudang yang punya pekerjaan di cabang `side`, dan kita mau menyalinnya ke `main`. Sebenarnya bisa pakai rebase, tapi ayo lihat cara cherry-pick.',
            ],
            afterMarkdowns: [
              'Selesai! Kita minta commit `C2` dan `C4`, lalu Git menaruhnya tepat di bawah kita. Sesederhana itu!',
            ],
            command: 'git cherry-pick C2 C4',
            beforeCommand:
              'git checkout -b side; git commit; git commit; git commit; git checkout main; git commit;',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Salin beberapa pekerjaan dari tiga cabang yang ada ke dalam `main`.',
              '',
              'Lihat gambar target untuk tahu commit mana saja yang harus kamu petik.',
            ],
          },
        },
      ],
    },
  },

  interactiveRebase: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Rebase Pilih Sendiri',
              '',
              'Cherry-pick enak dipakai kalau kamu **sudah tahu** commit mana yang kamu mau.',
              '',
              'Tapi kalau kamu belum tahu? Tenang, Git punya jawabannya: **rebase interaktif**. Git akan menunjukkan daftar commit-nya dulu, baru kamu pilih.',
              '',
              'Ayo kita lihat.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Rebase interaktif itu cuma `rebase` biasa yang diberi tambahan `-i`.',
              '',
              'Kalau kamu pakai `-i`, Git membuka jendela berisi daftar commit yang akan disalin. Jadi kamu bisa melihat dulu semuanya sebelum memutuskan.',
              '',
              'Di Git sungguhan, jendela itu berupa file teks yang dibuka di editor. Di game ini, kita pakai kotak dialog yang gampang dipakai.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Di kotak dialog itu kamu bisa melakukan dua hal:',
              '',
              '* **Mengubah urutan** commit, pakai tombol panah `↑` dan `↓`.',
              '* **Membuang** commit yang tidak kamu inginkan, pakai tombol `×`. Pencet lagi kalau berubah pikiran.',
              '',
              '*Di Git sungguhan kamu bisa melakukan lebih banyak lagi, misalnya menggabungkan beberapa commit jadi satu atau mengubah pesannya. Tapi di sini kita fokus ke dua hal di atas saja.*',
              '',
              'Ayo lihat contohnya!',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Pencet tombolnya, lalu perhatikan commit-commit itu disalin ulang sesuai urutan yang dipilih.',
            ],
            afterMarkdowns: [
              'Mantap! Git menyalin commit-nya persis seperti urutan yang diminta.',
            ],
            command: 'git rebase -i HEAD~4 --aboveAll',
            beforeCommand: 'git commit; git commit; git commit; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Lakukan rebase interaktif sampai urutannya sama seperti gambar target.',
              '',
              'Kalau salah, santai saja -- kamu selalu bisa pakai tombol **Kembali** atau **Ulangi level**. :D',
            ],
          },
        },
      ],
    },
  },

  staging: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Meja Persiapan',
              '',
              'Selama ini kita commit begitu saja. Padahal sebelum masuk ke commit, tiap file harus **dipilih** dulu.',
              '',
              'Kenapa? Karena Git sengaja tidak asal memasukkan semua file. Bisa bahaya! Nanti ada file rahasia (misalnya kata sandi) yang ikut terkirim ke internet.',
              '',
              'Git punya tiga tempat:',
              '',
              '* **Meja kerja** -- tempat kamu mengetik dan mengubah file',
              '* **Meja persiapan** -- tempat menaruh file yang siap masuk commit berikutnya',
              '* **Gudang** -- sejarah permanenmu',
              '',
              'Kamu memilih isi tiap commit pakai `git add`. Jadi commit-mu selalu rapi, dan kamu tidak dipaksa mengirim semuanya sekaligus.',
              '',
              '*(Mulai level ini, nama file akan ditampilkan di tiap commit.)*',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Ketik `git status` kapan saja untuk melihat keadaan. Sekarang ada dua file yang sudah kamu ubah tapi belum disiapkan:',
              '',
              '```',
              'Changes not staged for commit:',
              '  modified:   app.js',
              '  modified:   styles.css',
              '```',
              '',
              'Naikkan satu file ke meja persiapan dengan `git add app.js`, atau semuanya sekaligus dengan `git add .`.',
              '',
              'Setelah file ada di meja persiapan, `git commit` akan menyimpannya jadi satu foto.',
              '',
              'Punya file yang tidak pernah mau kamu commit, misalnya file rahasia atau sampah? Tulis namanya di file `.gitignore`, nanti Git akan diam-diam mengabaikannya.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Simpan pekerjaanmu **satu file satu commit**, supaya tiap commit isinya jelas:',
              '',
              '* `git add app.js`, lalu `git commit`',
              '* `git add styles.css`, lalu `git commit`',
              '',
              'Nama file di sebelah tiap commit target menunjukkan mana yang harus masuk ke mana. Dua commit rapi, dan level ini selesai.',
            ],
          },
        },
      ],
    },
  },

  restore: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Batalin pakai `git restore`',
              '',
              'Semua orang pernah berantakan. Salah menaikkan file ke meja persiapan, atau mencoba sesuatu yang ternyata jelek dan mau dibuang.',
              '',
              '`git restore` itu tombol "batal" khusus untuk meja kerja dan meja persiapan.',
              '',
              'Ada dua rasa:',
              '',
              '* `git restore --staged <file>` -- **turunkan** file dari meja persiapan, tapi hasil ketikanmu tetap aman',
              '* `git restore <file>` -- **buang** semua perubahanmu di file itu (hati-hati, ini benar-benar hilang!)',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Ini keadaan mejamu sekarang:',
              '',
              '```',
              'Changes to be committed:',
              '  modified:   app.js',
              '  modified:   secret.env',
              '',
              'Changes not staged for commit:',
              '  modified:   experiment.js',
              '```',
              '',
              'Kamu ingin commit `app.js`. Tapi `secret.env` kenaikan ke meja persiapan tanpa sengaja, jadi turunkan dulu.',
              '',
              'Lalu `experiment.js` itu percobaan yang gagal, jadi buang saja seluruhnya.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Rapikan dulu, baru commit:',
              '',
              '* Turunkan yang rahasia: `git restore --staged secret.env`',
              '* Buang percobaannya: `git restore experiment.js`',
              '* Simpan sisanya: `git commit`',
              '',
              'Hasilnya satu commit bersih, isinya cuma pekerjaan yang memang kamu mau.',
            ],
          },
        },
      ],
    },
  },
};
