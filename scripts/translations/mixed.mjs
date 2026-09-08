/** Indonesian lesson text for the "Pasar Campur" (mixed) zone. */
export const translations = {
  grabbingOneCommit: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Commit yang menumpuk',
              '',
              'Ini sering terjadi waktu ngoding beneran. Kamu sedang berburu bug yang susah ketemu. Supaya gampang, kamu menyelipkan beberapa perintah *debug* dan *print* untuk mengintip apa yang terjadi.',
              '',
              'Semua percobaan itu jadi commit sendiri-sendiri. Akhirnya bug-nya ketemu, kamu perbaiki, hore!',
              '',
              'Masalahnya: sekarang perbaikan di `bugFix` harus masuk ke `main`. Kalau kamu majukan `main` begitu saja, semua commit debug tadi ikut terbawa. Berantakan!',
              '',
              'Pasti ada cara lain...',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Kita harus menyuruh Git menyalin **satu commit saja**.',
              '',
              'Ini persis seperti level-level "memindahkan pekerjaan" tadi. Jadi alatnya juga sama:',
              '',
              '* `git rebase -i`',
              '* `git cherry-pick`',
              '',
              'Dua-duanya bisa dipakai untuk tugas ini.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Ini level agak lanjut, jadi kamu yang menentukan mau pakai cara yang mana.',
              '',
              'Yang penting: `main` harus mendapat commit yang ditunjuk oleh `bugFix`.',
            ],
          },
        },
      ],
    },
  },

  jugglingCommits: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Main Sulap Commit',
              '',
              'Ini juga sering terjadi. Kamu punya satu pekerjaan (`newImage`) dan pekerjaan lain (`caption`) yang saling berhubungan, jadi keduanya bertumpuk satu di atas yang lain.',
              '',
              'Repotnya: kadang kamu perlu memperbaiki sedikit commit yang **sudah lama**. Di sini, bagian desain minta ukuran `newImage` diubah sedikit -- padahal commit itu sudah jauh di belakang!',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Triknya begini:',
              '',
              '* Ubah urutan commit pakai `git rebase -i`, supaya commit yang mau diperbaiki ada di paling atas',
              '* Perbaiki dengan `git commit --amend`',
              '* Kembalikan urutannya seperti semula, lagi-lagi pakai `git rebase -i`',
              '* Terakhir, majukan `main` ke hasil terbaru (bebas caranya)',
              '',
              'Sebenarnya ada banyak cara lain (iya, aku lihat kamu melirik cherry-pick), dan nanti kita bahas. Tapi sekarang fokus ke cara ini dulu ya.',
              '',
              'Perhatikan gambar targetnya: karena commit-nya dipindah **dua kali**, keduanya dapat tanda petik. Lalu commit yang diperbaiki dapat satu petik tambahan.',
              '',
              'Tenang, jumlah petiknya tidak harus persis sama. Asal bentuk pohon di cabang `main` sudah benar dan **selisih** petiknya cocok, level ini dihitung selesai.',
            ],
          },
        },
      ],
    },
  },

  jugglingCommits2: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Main Sulap Commit #2',
              '',
              '*Kalau kamu belum menyelesaikan "Main Sulap Commit" yang pertama, selesaikan dulu ya sebelum lanjut.*',
              '',
              'Di level sebelumnya kita memakai `rebase -i` untuk mengubah urutan. Setelah commit yang mau diperbaiki ada di atas, kita amend, lalu kembalikan urutannya.',
              '',
              'Masalahnya, bolak-balik mengubah urutan itu bisa memicu bentrokan (conflict). Ayo coba cara lain pakai `git cherry-pick`.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ingat, `git cherry-pick` bisa mengambil commit dari mana saja di pohon lalu menaruhnya di atas HEAD (asalkan commit itu bukan nenek moyang HEAD).',
              '',
              'Ini contoh pengingat singkat:',
            ],
            afterMarkdowns: ['Mantap! Ayo lanjut.'],
            command: 'git cherry-pick C2',
            beforeCommand: 'git checkout -b bugFix; git commit; git checkout main; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Tujuannya sama seperti tadi: perbaiki `C2` satu kali. Tapi kali ini **tanpa** `rebase -i`.',
              '',
              'Silakan pikirkan sendiri caranya ya! :D',
              '',
              'Ingat, jumlah tanda petik (\') tidak harus persis. Yang penting selisihnya cocok. Kalau pohonmu sama bentuknya tapi petiknya lebih satu di semua commit, tetap dihitung benar.',
            ],
          },
        },
      ],
    },
  },

  tags: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Tag: Penanda Permanen',
              '',
              'Kamu sudah tahu cabang itu gampang dipindah-pindah. Cabang memang begitu: berubah terus, sering cuma sementara.',
              '',
              'Lalu bagaimana kalau kamu mau menandai satu titik penting dalam sejarah **selamanya**? Misalnya "ini versi 1.0 yang dirilis". Adakah penanda yang lebih awet daripada cabang?',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Ada dong! Namanya **tag**.',
              '',
              'Tag menandai commit tertentu sebagai tonggak penting, dan kamu bisa menyebutnya seperti cabang.',
              '',
              'Bedanya yang paling penting: **tag tidak pernah ikut maju** walaupun kamu bikin commit baru. Kamu juga tidak bisa "berdiri" di tag lalu bekerja di sana. Tag itu seperti patok yang ditancapkan di tanah.',
              '',
              'Ayo lihat contohnya.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo bikin tag di `C1`, anggap itu purwarupa versi 1 kita.'],
            afterMarkdowns: [
              'Nah! Gampang kan. Kita beri nama tag-nya `v1` dan menyebut commit `C1` secara langsung.',
              '',
              'Kalau nama commit-nya tidak kamu sebut, Git akan memakai posisi `HEAD` saat itu.',
            ],
            command: 'git tag v1 C1',
            beforeCommand: 'git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Buat tag-tag seperti di gambar target, lalu pindah ke `v1`.',
              '',
              'Perhatikan: HEAD kamu jadi terlepas. Itu wajar, karena kamu memang tidak bisa commit langsung di atas sebuah tag.',
              '',
              'Di level berikutnya kita pakai tag untuk hal yang lebih seru.',
            ],
          },
        },
      ],
    },
  },

  describe: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Git Describe',
              '',
              'Karena tag itu patok yang tidak pernah bergerak, Git punya perintah untuk memberitahu **kamu ada di mana** relatif terhadap patok terdekat.',
              '',
              'Namanya `git describe`!',
              '',
              'Ini berguna kalau kamu sudah melompat jauh maju-mundur di sejarah dan bingung sedang di mana. Misalnya sehabis berburu bug, atau waktu duduk di komputer teman yang baru pulang liburan.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Bentuknya begini:',
              '',
              '`git describe <ref>`',
              '',
              '`<ref>` itu apa saja yang bisa Git artikan sebagai commit. Kalau tidak kamu isi, Git memakai posisimu sekarang (`HEAD`).',
              '',
              'Hasilnya berbentuk:',
              '',
              '`<tag>-<jumlahCommit>-g<nama>`',
              '',
              'Artinya: `tag` adalah patok terdekat di belakangmu, `jumlahCommit` adalah berapa langkah jaraknya, dan `<nama>` adalah nama commit yang sedang dijelaskan.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo lihat contoh cepat. Untuk pohon di bawah ini:'],
            afterMarkdowns: [
              'Perintah `git describe main` akan menghasilkan:',
              '',
              '`v1-2-gC2`',
              '',
              'Sedangkan `git describe side` menghasilkan:',
              '',
              '`v2-1-gC4`',
            ],
            command: 'git tag v2 C3',
            beforeCommand: 'git commit; go -b side HEAD~1; gc; gc; git tag v1 C0',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Cuma segitu saja isi `git describe`! Coba jalankan di beberapa tempat di level ini supaya kamu terbiasa.',
              '',
              'Kalau sudah puas, cukup commit sekali untuk menyelesaikan level. Anggap saja ini bonus. :P',
            ],
          },
        },
      ],
    },
  },
};
