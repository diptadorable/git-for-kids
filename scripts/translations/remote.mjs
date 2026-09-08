/** Indonesian lesson text for the "Pelabuhan Jauh" (remote) zone. */
export const translations = {
  clone: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Gudang Jauh (Remote)',
              '',
              'Remote itu sebenarnya tidak rumit kok. Remote cuma **salinan gudangmu yang disimpan di komputer lain**. Kamu bisa mengobrol dengan komputer itu lewat internet, jadi commit bisa dikirim bolak-balik.',
              '',
              'Kenapa remote itu keren?',
              '',
              '- **Cadangan.** Kalau laptopmu rusak atau hilang, pekerjaanmu aman karena ada salinannya di sana. Kamu tinggal lanjut dari situ.',
              '',
              '- **Bisa ramai-ramai!** Karena proyekmu ada di tempat yang bisa diakses bersama, teman-temanmu bisa ikut membantu atau mengambil pekerjaan terbarumu.',
              '',
              'Situs seperti [GitHub](https://github.com/) itu sebenarnya cuma tampilan cantik di atas remote. Mesin di baliknya ya remote ini. Makanya penting untuk paham!',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Perintah untuk memulai',
              '',
              'Sampai sekarang kita cuma bermain di gudang sendiri: bikin cabang, merge, rebase. Sekarang kita mau belajar gudang jauh, jadi kita butuh perintah untuk menyiapkannya: `git clone`.',
              '',
              'Sama seperti `git clone` sungguhan, kami sudah menyiapkan sebuah remote untuk pelajaran ini. Menjalankan `git clone` akan menariknya turun ke gudang lokalmu.',
              '',
              'Mulai sekarang, `o/main` di gudang lokalmu artinya "posisi cabang `main` milik remote **waktu terakhir kali** kamu mengeceknya".',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Pelan-pelan saja. Ayo lihat dulu bentuk sebuah gudang jauh sebelum kita salin.',
            ],
            afterMarkdowns: [
              'Nah, itu dia! Sekarang kamu punya salinan sendiri di komputermu.',
              '',
              'Bentuknya mirip, cuma dibedakan tampilannya biar jelas mana yang punyamu dan mana yang punya remote. Di level-level berikutnya kita belajar cara bertukar pekerjaan di antara keduanya.',
            ],
            command: 'git clone',
            beforeCommand: '',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Cukup jalankan `git clone` untuk menyalin remote yang sudah kami siapkan.',
              '',
              'Pelajaran yang sesungguhnya baru dimulai di level berikutnya!',
            ],
          },
        },
      ],
    },
  },

  remoteBranches: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Cabang di Seberang',
              '',
              'Kamu sudah melihat `git clone` bekerja. Sekarang mari lihat apa sebenarnya yang berubah.',
              '',
              'Yang pertama kelihatan: muncul cabang baru bernama `o/main`. Ini disebut **cabang remote**, dan sifatnya spesial.',
              '',
              'Cabang remote menunjukkan **keadaan gudang jauh** waktu terakhir kali kamu mengobrol dengannya. Gunanya untuk membedakan mana pekerjaan yang masih di komputermu sendiri dan mana yang sudah dilihat orang lain.',
              '',
              'Sifat spesialnya: kalau kamu pindah ke cabang remote, HEAD kamu jadi **terlepas**. Git sengaja begitu, karena kamu memang tidak boleh bekerja langsung di sana. Kamu harus bekerja di tempat lain, lalu mengirimkannya ke remote.',
              '',
              'Perlu diingat: cabang remote itu ada di **komputermu**, bukan di komputer seberang.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Kenapa ada `o/`?',
              '',
              'Kamu mungkin bertanya-tanya, kenapa ada tulisan `o/` di depannya?',
              '',
              'Karena cabang remote punya aturan penamaan:',
              '',
              '* `<nama remote>/<nama cabang>`',
              '',
              'Jadi kalau kamu lihat `o/main`, artinya nama cabangnya `main` dan nama remote-nya `o`.',
              '',
              'Di dunia nyata, orang biasanya menamai remote utamanya `origin`, bukan `o`. Saking umumnya, `git clone` otomatis memberi nama `origin`.',
              '',
              'Sayangnya tulisan `origin` kepanjangan untuk layar kita, jadi kita singkat jadi `o` saja. Tapi ingat ya, di Git sungguhan namanya kemungkinan besar `origin`!',
              '',
              'Banyak juga yang harus dicerna. Ayo langsung lihat contohnya.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo pindah ke cabang remote dan lihat apa yang terjadi.'],
            afterMarkdowns: [
              'Lihat kan? Git membuat HEAD kita terlepas. Lalu waktu kita bikin commit baru, `o/main` **tidak ikut maju**.',
              '',
              'Itu karena `o/main` cuma berubah kalau gudang jauhnya sendiri yang berubah.',
            ],
            command: 'git checkout o/main; git commit',
            beforeCommand: 'git fakeCreateRemote',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Commit sekali dari `main`, lalu pindah ke `o/main` dan commit sekali lagi.',
              '',
              'Ini akan membuatmu benar-benar merasakan bedanya cabang remote: dia hanya ikut berubah kalau gudang jauhnya berubah.',
            ],
          },
        },
      ],
    },
  },

  fetch: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Git Fetch',
              '',
              'Bekerja dengan remote sebenarnya cuma soal **memindahkan data** ke sana dan dari sana. Selama commit bisa dikirim bolak-balik, apa pun bisa dibagi: kode, file baru, ide baru, apa saja.',
              '',
              'Di pelajaran ini kita belajar mengambil data **dari** gudang jauh. Perintahnya pas sekali namanya: `git fetch`.',
              '',
              'Nanti kamu akan lihat, begitu gambaran kita tentang remote diperbarui, cabang remote (`o/main`) ikut bergeser mengikutinya.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Sebelum masuk ke detailnya, ayo lihat dulu. Di sini gudang jauh punya dua commit yang belum ada di gudang kita.',
            ],
            afterMarkdowns: [
              'Nah! Commit `C2` dan `C3` sudah terunduh ke gudang kita, dan cabang `o/main` ikut maju mengikutinya.',
            ],
            command: 'git fetch',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork 2',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Apa yang dilakukan fetch',
              '',
              '`git fetch` cuma melakukan **dua hal**, tidak lebih:',
              '',
              '* mengunduh commit yang dimiliki remote tapi belum kamu punya, lalu...',
              '* menggeser cabang remote-mu (misalnya `o/main`) ke posisi terbaru',
              '',
              'Intinya, `git fetch` menyamakan gambaranmu tentang gudang jauh dengan keadaan **sebenarnya** di sana sekarang.',
              '',
              'Ingat pelajaran sebelumnya? Cabang remote menunjukkan keadaan remote *sejak terakhir kali* kamu mengobrol dengannya. Nah, `git fetch` itulah cara mengobrolnya!',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Yang TIDAK dilakukan fetch',
              '',
              'Ini penting: `git fetch` **tidak mengubah pekerjaanmu sendiri sama sekali**. Cabang `main` milikmu tidak bergerak, file-filemu juga tidak berubah.',
              '',
              'Banyak orang salah paham dan mengira setelah `git fetch` pekerjaan mereka jadi ikut terbaru. Padahal tidak. Fetch cuma mengunduh bahannya saja.',
              '',
              'Jadi anggap saja `git fetch` itu tombol **unduh**. Cara memakai hasil unduhannya kita pelajari di level berikutnya. :D',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Cukup jalankan `git fetch` untuk mengunduh semua commit-nya!',
            ],
          },
        },
      ],
    },
  },

  pull: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Git Pull',
              '',
              'Kita sudah bisa mengunduh dengan `git fetch`. Sekarang, bagaimana cara memakai hasil unduhan itu?',
              '',
              'Sebenarnya banyak caranya. Begitu commit-nya ada di komputermu, dia jadi commit biasa yang bisa kamu perlakukan sesukamu:',
              '',
              '* `git cherry-pick o/main`',
              '* `git rebase o/main`',
              '* `git merge o/main`',
              '* dan seterusnya',
              '',
              'Karena urutan "fetch lalu merge" itu **sangat sering** dipakai, Git menyediakan satu perintah yang melakukan keduanya sekaligus: `git pull`.',
              '',
              '*Catatan: di Git versi baru, `git pull` polos akan berhenti dan bertanya kalau sejarahnya bercabang dua. Kamu bisa pilih `git pull --no-rebase` untuk merge, atau `git pull --rebase` untuk rebase. Di game ini, `git pull` otomatis berarti merge.*',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Pertama, ayo lihat `fetch` lalu `merge` dijalankan berurutan.'],
            afterMarkdowns: [
              'Mantap! Kita mengunduh `C3` dengan `fetch`, lalu menggabungkannya dengan `git merge o/main`.',
              '',
              'Sekarang cabang `main` kita sudah berisi pekerjaan baru dari remote.',
            ],
            command: 'git fetch; git merge o/main',
            beforeCommand: 'git fakeCreateRemote; git commit; git fakeTeamwork',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Apa yang terjadi kalau kita pakai `git pull` saja?'],
            afterMarkdowns: [
              'Sama persis! Jadi jelas ya: `git pull` itu singkatan dari `git fetch` lalu merge cabang yang barusan diunduh.',
            ],
            command: 'git pull',
            beforeCommand: 'git fakeCreateRemote; git commit; git fakeTeamwork',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Nanti kita bahas `git pull` lebih dalam (termasuk pilihan-pilihannya). Sekarang coba dulu di level ini.',
              '',
              'Ingat, kamu sebenarnya bisa juga menyelesaikannya dengan `fetch` + `merge`. Tapi itu butuh satu perintah lebih banyak. :P',
            ],
          },
        },
      ],
    },
  },

  fakeTeamwork: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Pura-pura punya teman',
              '',
              'Ada masalah kecil: di level-level berikutnya kamu harus belajar menarik perubahan yang dibuat orang lain di remote.',
              '',
              'Masalahnya, di sini cuma ada kamu. Jadi kita perlu **berpura-pura** bahwa ada teman yang mengirim pekerjaan ke remote.',
              '',
              'Untuk itu ada perintah `git fakeTeamwork`! Namanya sudah menjelaskan sendiri. Ayo lihat contohnya...',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Kalau dipakai polos, `fakeTeamwork` cuma menaruh satu commit di cabang main milik remote.',
            ],
            afterMarkdowns: [
              'Nah -- gudang jauhnya dapat commit baru. Tapi kita belum punya commit itu, karena kita belum menjalankan `git fetch`.',
            ],
            command: 'git fakeTeamwork',
            beforeCommand: 'git fakeCreateRemote',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Kamu juga bisa menyebutkan nama cabang dan berapa banyak commit yang mau dibuat.',
            ],
            afterMarkdowns: [
              'Cuma dengan satu perintah, kita berpura-pura teman kita mengirim tiga commit ke cabang `foo` di remote.',
            ],
            command: 'git fakeTeamwork foo 3',
            beforeCommand: 'git branch foo; git fakeCreateRemote',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Level berikutnya bakal lumayan susah, jadi di sini kamu diminta melakukan beberapa hal sekaligus:',
              '',
              '* Salin gudang jauhnya (`git clone`)',
              '* Pura-pura ada teman yang mengirim pekerjaan ke sana',
              '* Bikin satu commit sendiri',
              '* Lalu tarik perubahan dari remote dan gabungkan',
              '',
              'Seperti beberapa pelajaran digabung jadi satu!',
            ],
          },
        },
      ],
    },
  },

  push: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Git Push',
              '',
              'Oke, kita sudah bisa mengambil pekerjaan orang lain. Tapi bagaimana caranya membagikan **pekerjaan kita** ke semua orang?',
              '',
              'Gampang: kalau kebalikan dari mengunduh adalah mengunggah, maka kebalikan dari `git pull` adalah... `git push`!',
              '',
              '`git push` bertugas mengunggah perubahanmu ke remote dan memperbarui remote itu supaya berisi commit barumu. Begitu selesai, semua temanmu bisa mengunduh hasil kerjamu.',
              '',
              'Anggap saja `git push` itu tombol "terbitkan". Ada beberapa hal rumit yang nanti kita bahas, tapi ayo mulai dari yang paling sederhana dulu...',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Di sini kita punya perubahan yang belum dimiliki remote. Ayo kita unggah!',
            ],
            afterMarkdowns: [
              'Nah! Remote menerima commit `C2`, cabang `main` di sana ikut maju ke `C2`, dan gambaran kita tentang remote (`o/main`) juga ikut diperbarui.',
              '',
              'Semuanya sudah seragam!',
            ],
            command: 'git push',
            beforeCommand: 'git fakeCreateRemote; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Bagikan dua commit baru ke remote.',
              '',
              'Siap-siap ya, karena mulai sesudah ini pelajarannya jadi jauh lebih menantang!',
            ],
          },
        },
      ],
    },
  },

  fetchRebase: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Sejarah Bercabang Dua',
              '',
              'Sejauh ini kita sudah bisa `pull` untuk mengambil pekerjaan orang lain, dan `push` untuk membagikan pekerjaan kita. Kelihatannya gampang. Lalu kenapa banyak orang bingung soal ini?',
              '',
              'Kesulitannya muncul kalau sejarahnya **bercabang dua**. Sebelum membahas detailnya, ayo lihat contohnya dulu...',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Bayangkan hari Senin kamu menyalin sebuah proyek, lalu mulai mengerjakan fitur kecil.',
              '',
              'Hari Jumat fiturmu siap diterbitkan -- tapi aduh! Selama seminggu itu teman-temanmu sudah menulis banyak kode baru, dan pekerjaanmu jadi ketinggalan zaman. Mereka juga sudah mengirimkannya ke remote.',
              '',
              'Jadi sekarang pekerjaanmu dibangun di atas versi **lama** yang sudah tidak berlaku.',
              '',
              'Kalau kamu jalankan `git push`, Git jadi bingung. Apakah dia harus mengembalikan remote ke keadaan hari Senin? Atau menyisipkan kodemu tanpa menghapus kode baru? Atau mengabaikan pekerjaanmu?',
              '',
              'Karena terlalu banyak kemungkinan, Git **menolak** push-mu. Kamu dipaksa menyesuaikan diri dengan keadaan remote terbaru dulu sebelum boleh berbagi.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Kebanyakan ngobrol! Ayo lihat langsung keadaannya.'],
            afterMarkdowns: [
              'Lihat? Tidak terjadi apa-apa, karena perintahnya gagal.',
              '',
              '`git push` ditolak karena commit terbarumu `C3` dibangun di atas remote versi `C1`. Padahal remote sudah maju ke `C2`. Jadi Git menolak.',
            ],
            command: 'git push',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Bagaimana cara membereskannya? Gampang: pindahkan pekerjaanmu supaya berdiri di atas versi remote yang terbaru.',
              '',
              'Ada beberapa cara, tapi yang paling lurus adalah memindahkannya pakai **rebase**. Ayo lihat.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Sekarang coba kita rebase dulu sebelum push...'],
            afterMarkdowns: [
              'Berhasil! Kita perbarui gambaran remote dengan `git fetch`, pindahkan pekerjaan kita ke atas yang terbaru dengan rebase, lalu kirim dengan `git push`.',
            ],
            command: 'git fetch; git rebase o/main; git push',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Apakah ada cara lain kalau remote sudah berubah? Tentu ada! Ayo coba hal yang sama tapi pakai `merge`.',
              '',
              'Merge memang tidak memindahkan pekerjaanmu, dia cuma membuat satu commit gabungan. Tapi itu sudah cukup untuk memberitahu Git bahwa kamu sudah memasukkan semua perubahan dari remote.',
              '',
              'Kenapa cukup? Karena setelah merge, cabang remote jadi **nenek moyang** cabangmu. Artinya commit-mu sudah mencakup semua yang ada di sana.',
              '',
              'Ayo lihat contohnya...',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Sekarang kita merge, bukan rebase...'],
            afterMarkdowns: [
              'Berhasil juga! Kita perbarui gambaran remote dengan `git fetch`, *gabungkan* pekerjaan baru itu ke pekerjaan kita, lalu kirim dengan `git push`.',
            ],
            command: 'git fetch; git merge o/main; git push',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Keren! Tapi apa tidak ada cara yang lebih singkat, biar tidak mengetik sebanyak itu?',
              '',
              'Tentu ada. Kamu sudah tahu `git pull` itu singkatan dari fetch + merge. Nah, kebetulan sekali `git pull --rebase` adalah singkatan dari fetch + rebase!',
              '',
              'Ayo lihat versi singkatnya bekerja.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Pertama pakai `--rebase`...'],
            afterMarkdowns: ['Sama seperti tadi! Cuma jauh lebih pendek.'],
            command: 'git pull --rebase; git push',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Sekarang pakai `pull` biasa.'],
            afterMarkdowns: ['Lagi-lagi sama persis seperti sebelumnya!'],
            command: 'git pull; git push',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Alur "ambil, gabungkan, kirim" ini sangat sering dipakai sehari-hari. Ayo coba sekarang.',
              '',
              'Langkah-langkahnya:',
              '',
              '* Salin gudangnya (`clone`)',
              '* Pura-pura ada teman yang mengirim satu commit',
              '* Bikin satu commit sendiri',
              '* Terbitkan pekerjaanmu lewat **rebase**',
            ],
          },
        },
      ],
    },
  },

  lockedMain: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Ditolak Remote!',
              '',
              'Kalau kamu bekerja di tim besar, biasanya cabang `main` **dikunci**. Perubahan tidak boleh langsung masuk, harus lewat proses pemeriksaan dulu (namanya Pull Request).',
              '',
              'Kalau kamu nekat commit langsung ke `main` lalu push, kamu akan disambut pesan seperti ini:',
              '',
              '```',
              ' ! [remote rejected] main -> main (Pushes to this branch are not permitted; you must use a pull request to update this branch.)',
              '```',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Kenapa ditolak?',
              '',
              'Remote menolak karena ada aturan di cabang `main`: semua perubahan wajib lewat Pull Request.',
              '',
              'Sebenarnya kamu berniat mengikuti aturan itu -- bikin cabang dulu, kirim cabangnya, baru minta diperiksa. Tapi kamu lupa, dan malah langsung commit ke `main`.',
              '',
              'Sekarang kamu tersangkut dan tidak bisa mengirim pekerjaanmu.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Cara membereskannya',
              '',
              'Buat cabang baru bernama `feature`, lalu kirim cabang itu ke remote.',
              '',
              'Jangan lupa juga kembalikan `main` milikmu supaya sama lagi dengan `main` milik remote. Kalau tidak, nanti waktu kamu `pull` lagi, commit-mu bisa bentrok dengan commit orang lain.',
            ],
          },
        },
      ],
    },
  },
};
