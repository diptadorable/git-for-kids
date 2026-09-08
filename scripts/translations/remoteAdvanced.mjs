/** Indonesian lesson text for the "Benteng Origin" (remoteAdvanced) zone. */
export const translations = {
  pushManyFeatures: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Menggabungkan Cabang Fitur',
              '',
              'Sekarang kamu sudah lancar fetch, pull, dan push. Ayo kita pakai semuanya dalam satu alur kerja baru.',
              '',
              'Di proyek besar, biasanya orang mengerjakan tiap fitur di cabangnya sendiri (bercabang dari `main`), lalu menggabungkannya kalau sudah benar-benar siap.',
              '',
              'Banyak orang hanya push dan pull saat sedang berada di `main`. Dengan begitu `main` selalu sama dengan yang ada di remote (`o/main`).',
              '',
              'Jadi di alur kerja ini kita menggabungkan dua hal:',
              '',
              '* memasukkan pekerjaan dari cabang fitur ke `main`, dan',
              '* mengambil serta mengirim ke remote',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ayo kita ingat lagi sebentar cara memperbarui `main` lalu mengirim pekerjaan.',
            ],
            afterMarkdowns: [
              'Dua perintah tadi melakukan ini:',
              '',
              '* memindahkan pekerjaan kita ke atas commit baru dari remote, lalu',
              '* menerbitkan pekerjaan kita ke remote',
            ],
            command: 'git pull --rebase; git push',
            beforeCommand: 'git fakeCreateRemote; git commit; git fakeTeamwork',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Level ini lumayan berat. Ini garis besarnya:',
              '',
              '* Ada tiga cabang fitur: `side1`, `side2`, dan `side3`',
              '* Kirim ketiganya ke remote, **berurutan**',
              '* Remote juga sudah berubah, jadi pekerjaan orang lain harus ikut kamu masukkan',
              '',
              ':O seru! Kalau kamu berhasil menyelesaikan level ini, itu kemajuan besar.',
            ],
          },
        },
      ],
    },
  },

  mergeManyFeatures: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Kenapa tidak merge saja?',
              '',
              'Supaya bisa mengirim perubahan ke remote, yang kamu butuhkan cuma satu: **memasukkan perubahan terbaru dari remote** ke pekerjaanmu.',
              '',
              'Artinya kamu boleh pakai rebase **atau** merge dari cabang remote (misalnya `o/main`). Dua-duanya sah.',
              '',
              'Kalau begitu, kenapa dari tadi kita selalu pakai rebase? Kenapa `merge` seperti dianaktirikan?',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Soal rebase vs merge itu memang sering diperdebatkan para programmer. Ini untung ruginya rebase:',
              '',
              'Untungnya:',
              '',
              '* Pohon commit-mu jadi terlihat rapi, semuanya lurus satu garis',
              '',
              'Ruginya:',
              '',
              '* Rebase mengubah tampilan sejarahnya.',
              '',
              'Contohnya, commit `C1` bisa dipindah ke **belakang** `C3`. Jadi seolah-olah `C1\'` dikerjakan setelah `C3`, padahal aslinya dikerjakan duluan.',
              '',
              'Sebagian orang lebih suka menjaga sejarah apa adanya, jadi mereka pilih merge. Sebagian lain lebih suka pohon yang rapi, jadi pilih rebase. Ini soal selera saja. :D',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Selesaikan level yang sama seperti sebelumnya, tapi kali ini pakai **merge**.',
              '',
              'Hasilnya mungkin terlihat agak kusut, tapi justru itu yang mau ditunjukkan.',
            ],
          },
        },
      ],
    },
  },

  tracking: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Cabang yang saling terhubung',
              '',
              'Ada satu hal yang mungkin terasa "ajaib" di pelajaran-pelajaran tadi: Git tahu bahwa cabang `main` itu berpasangan dengan `o/main`.',
              '',
              'Memang namanya mirip, tapi hubungannya benar-benar nyata dan terlihat jelas di dua tempat:',
              '',
              '* Waktu `pull`, commit diunduh ke `o/main`, lalu digabungkan ke `main`. Git tahu harus menggabungkan ke mana karena hubungan ini.',
              '* Waktu `push`, pekerjaan dari `main` dikirim ke cabang `main` milik remote. Git tahu tujuannya juga karena hubungan ini.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Melacak cabang remote',
              '',
              'Singkatnya, hubungan antara `main` dan `o/main` itu namanya **remote tracking**. Cabang `main` disetel untuk melacak `o/main`. Dari situ Git tahu tujuan merge dan tujuan push-nya.',
              '',
              'Kamu mungkin heran, kapan setelan itu dibuat? Kamu kan tidak pernah mengetik perintah apa pun untuk itu.',
              '',
              'Jawabannya: waktu kamu `git clone`, Git otomatis menyetelnya untukmu.',
              '',
              'Saat clone, Git membuat cabang remote untuk setiap cabang di sana (seperti `o/main`). Lalu dia membuat satu cabang lokal yang melacak cabang yang sedang aktif di remote, biasanya `main`.',
              '',
              'Jadi setelah clone kamu cuma punya satu cabang lokal (biar tidak pusing), tapi tetap bisa melihat semua cabang yang ada di remote. Enak, kan!',
              '',
              'Itu sebabnya kadang kamu melihat pesan seperti ini saat clone:',
              '',
              '    local branch "main" set to track remote branch "o/main"',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Bisa disetel sendiri?',
              '',
              'Bisa dong! Cabang apa pun boleh kamu suruh melacak `o/main`. Kalau begitu, cabang itu punya tujuan push dan tujuan merge yang sama seperti `main`.',
              '',
              'Artinya kamu bisa menjalankan `git push` di cabang bernama `bukanMainSamaSekali`, dan pekerjaanmu tetap terkirim ke cabang `main` di remote!',
              '',
              'Ada dua cara menyetelnya. Cara pertama: bikin cabang baru dengan cabang remote sebagai acuannya.',
              '',
              '`git checkout -b bukanMainSamaSekali o/main`',
              '',
              'Itu membuat cabang baru sekaligus menyetelnya melacak `o/main`.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Cukup ngobrolnya, ayo lihat! Kita bikin cabang baru bernama `foo` dan menyuruhnya melacak `main` milik remote.',
            ],
            afterMarkdowns: [
              'Lihat, Git memakai `o/main` sebagai tujuan merge untuk memperbarui cabang `foo`.',
              '',
              'Perhatikan: cabang `main` sama sekali tidak ikut berubah!',
            ],
            command: 'git checkout -b foo o/main; git pull',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ini juga berlaku untuk `git push`.'],
            afterMarkdowns: [
              'Nah! Pekerjaan kita terkirim ke cabang `main` di remote, padahal nama cabang kita beda sama sekali.',
            ],
            command: 'git checkout -b foo o/main; git commit; git push',
            beforeCommand: 'git fakeCreateRemote',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Cara kedua',
              '',
              'Cara lain menyetelnya adalah dengan pilihan `git branch -u`. Menjalankan:',
              '',
              '`git branch -u o/main foo`',
              '',
              'akan menyuruh cabang `foo` melacak `o/main`. Kalau kamu memang sedang berada di `foo`, nama cabangnya boleh tidak ditulis:',
              '',
              '`git branch -u o/main`',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo lihat sebentar cara kedua ini bekerja...'],
            afterMarkdowns: ['Hasilnya sama saja, cuma perintahnya lebih gamblang. Mantap!'],
            command: 'git branch -u o/main foo; git commit; git push',
            beforeCommand: 'git fakeCreateRemote; git checkout -b foo',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Kirim pekerjaan ke cabang `main` di remote, tapi **tanpa** berada di `main` secara lokal.',
              '',
              'Sebagai gantinya, buat cabang bernama `side` seperti yang ditunjukkan gambar target.',
            ],
          },
        },
      ],
    },
  },

  pushArgs: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Argumen git push',
              '',
              'Bagus! Sekarang kamu sudah paham cabang remote tracking, jadi kita bisa membongkar rahasia cara kerja `push`, `fetch`, dan `pull`. Kita bahas satu-satu, tapi idenya mirip semua.',
              '',
              'Mulai dari `git push`. Kamu sudah tahu Git menebak remote **dan** cabang tujuannya dari setelan cabang yang sedang kamu tempati.',
              '',
              'Itu kalau kamu tidak memberi argumen. Padahal `git push` bisa diberi argumen begini:',
              '',
              '`git push <remote> <tempat>`',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Apa itu `<tempat>`? Nanti kita bahas detailnya, tapi lihat contohnya dulu. Perintah:',
              '',
              '`git push origin main`',
              '',
              'artinya kira-kira begini kalau dibaca:',
              '',
              '*"Pergi ke cabang bernama `main` di gudangku, ambil semua commit-nya. Lalu pergi ke cabang `main` di remote bernama `origin`. Taruh commit yang belum ada di sana, dan beritahu aku kalau sudah selesai."*',
              '',
              'Dengan menulis `main` sebagai "tempat", kita memberitahu Git dari mana commit-nya diambil **dan** ke mana harus ditaruh.',
              '',
              'Ingat ya: karena kita sudah memberitahu Git semuanya, dia jadi **tidak peduli** kamu sedang berada di cabang mana!',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Ayo lihat contoh dengan argumen. Perhatikan baik-baik kita sedang berada di mana pada contoh ini.',
            ],
            afterMarkdowns: [
              'Nah! Cabang `main` di remote tetap ikut diperbarui, karena kita menyebutkan argumennya.',
            ],
            command: 'git checkout C0; git push origin main',
            beforeCommand: 'git fakeCreateRemote; git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Bagaimana kalau argumennya tidak kita sebutkan? Apa yang terjadi?'],
            afterMarkdowns: [
              'Perintahnya gagal, seperti yang kamu lihat. Itu karena `HEAD` sedang tidak berada di cabang yang melacak remote.',
            ],
            command: 'git checkout C0; git push',
            beforeCommand: 'git fakeCreateRemote; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Perbarui cabang `foo` **dan** `main` di remote.',
              '',
              'Tantangannya: perintah `git checkout` dimatikan di level ini!',
              '',
              '*Catatan: cabang remote ditulis berawalan `o/` karena tulisan `origin/` kepanjangan untuk layar kita. Tapi saat mengetik perintah, pakai `origin` seperti biasa ya.*',
            ],
          },
        },
      ],
    },
  },

  pushArgs2: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Bedah argumen `<tempat>`',
              '',
              'Ingat pelajaran tadi: waktu kita menulis `main` sebagai tempat, itu sekaligus menentukan **asal** commit dan **tujuan**nya.',
              '',
              'Nah, bagaimana kalau kita mau asal dan tujuannya **berbeda**? Misalnya mengirim commit dari cabang `foo` di komputer kita ke cabang `bar` di remote?',
              '',
              'Sayangnya di Git itu tidak mungkin... bohong deng! :) Tentu saja bisa. Git itu lentur sekali, malah kadang kelewat lentur.',
              '',
              'Ayo lihat caranya di halaman berikutnya...',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Untuk menyebut asal dan tujuan sekaligus, sambungkan keduanya pakai titik dua:',
              '',
              '`git push origin <asal>:<tujuan>`',
              '',
              'Ini namanya *colon refspec*. "Refspec" itu cuma istilah keren untuk lokasi yang bisa dimengerti Git, misalnya cabang `foo` atau bahkan `HEAD~1`.',
              '',
              'Begitu kamu bisa menyebut asal dan tujuan sendiri-sendiri, perintah remote-mu jadi bisa sangat teliti. Ayo lihat contohnya!',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ingat, `asal` boleh berupa lokasi apa pun yang dimengerti Git:'],
            afterMarkdowns: [
              'Wow! Perintahnya terlihat aneh, tapi masuk akal: Git mengartikan `foo^` jadi sebuah lokasi, mengunggah commit yang belum ada di remote, lalu memperbarui tujuannya.',
            ],
            command: 'git push origin foo^:main',
            beforeCommand: 'git fakeCreateRemote; go -b foo; git commit; git commit',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Bagaimana kalau cabang tujuannya belum ada? Santai! Sebut saja namanya, nanti Git membuatkannya di remote.',
            ],
            afterMarkdowns: ['Keren ya, praktis banget. :D'],
            command: 'git push origin main:newBranch',
            beforeCommand: 'git fakeCreateRemote; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Capailah keadaan seperti gambar target.',
              '',
              'Ingat bentuknya ya: `<asal>:<tujuan>`',
            ],
          },
        },
      ],
    },
  },

  fetchArgs: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Argumen git fetch',
              '',
              'Kita baru saja belajar argumen `git push`, termasuk `<tempat>` dan colon refspec (`<asal>:<tujuan>`). Apakah ilmu itu bisa dipakai untuk `git fetch` juga?',
              '',
              'Tentu bisa! Argumen `git fetch` **sangat mirip** dengan `git push`. Idenya sama persis, cuma arahnya terbalik, karena sekarang kita mengunduh, bukan mengunggah.',
              '',
              'Ayo bahas satu per satu...',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Bagian `<tempat>`',
              '',
              'Kalau kamu menyebut tempat pada git fetch, misalnya:',
              '',
              '`git fetch origin foo`',
              '',
              'Git akan pergi ke cabang `foo` di remote, mengambil semua commit yang belum kamu punya, lalu menaruhnya di cabang `o/foo` di komputermu.',
              '',
              'Ayo lihat lagi supaya ingat.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Dengan menyebut sebuah tempat...'],
            afterMarkdowns: ['Kita cuma mengunduh commit dari `foo`, dan menaruhnya di `o/foo`.'],
            command: 'git fetch origin foo',
            beforeCommand: 'git branch foo; git fakeCreateRemote; git fakeTeamwork foo 2',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Kamu mungkin bertanya: kenapa commit-nya ditaruh di `o/foo`, bukan langsung ke cabang `foo` milikku? Bukankah `<tempat>` itu tempat yang ada di dua-duanya?',
              '',
              'Git sengaja bikin pengecualian di sini, karena bisa saja kamu punya pekerjaan di cabang `foo` yang belum selesai. Sayang kalau tertimpa!',
              '',
              'Ini nyambung dengan pelajaran `git fetch` yang dulu: fetch **tidak pernah** mengubah cabang lokalmu. Dia cuma mengunduh commit, supaya bisa kamu periksa atau gabungkan nanti.',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '"Kalau begitu, apa yang terjadi kalau aku menyebut asal dan tujuan sekaligus pakai `<asal>:<tujuan>`?"',
              '',
              'Kalau kamu memang nekat mau mengunduh commit **langsung** ke cabang lokal, ya boleh. Syaratnya cuma satu: cabang tujuannya tidak boleh sedang kamu tempati.',
              '',
              'Tapi ada yang harus kamu perhatikan: sekarang `<asal>` itu tempat di **remote**, dan `<tujuan>` itu tempat di **komputermu**. Persis kebalikan dari git push!',
              '',
              'Masuk akal kan, karena arah perpindahan datanya juga terbalik.',
              '',
              'Sebenarnya jarang ada yang memakai cara ini sehari-hari. Aku tunjukkan supaya kamu paham bahwa `fetch` dan `push` itu memang mirip, cuma berlawanan arah.',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Ayo lihat keanehan ini bekerja:'],
            afterMarkdowns: [
              'Wow! Git mengartikan `C2` sebagai lokasi di remote, lalu mengunduh commit-nya ke `bar`, yang merupakan cabang lokal.',
            ],
            command: 'git fetch origin C2:bar',
            beforeCommand:
              'git branch foo; git fakeCreateRemote; git branch bar; git fakeTeamwork foo 2',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Bagaimana kalau cabang tujuannya belum ada? Ayo ulangi contoh tadi, tapi kali ini `bar` belum dibuat.',
            ],
            afterMarkdowns: [
              'Lihat, persis seperti git push. Git membuatkan cabang tujuannya dulu di komputermu, sama seperti git push yang membuatkan cabang tujuan di remote kalau belum ada.',
            ],
            command: 'git fetch origin C2:bar',
            beforeCommand: 'git branch foo; git fakeCreateRemote; git fakeTeamwork foo 2',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Tanpa argumen?',
              '',
              'Kalau `git fetch` dijalankan polos tanpa argumen, dia mengunduh semua commit dari remote ke semua cabang remote...',
            ],
            afterMarkdowns: ['Sederhana, tapi perlu dilihat sekali biar jelas.'],
            command: 'git fetch',
            beforeCommand:
              'git branch foo; git fakeCreateRemote; git fakeTeamwork foo; git fakeTeamwork main',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Cukup ngobrolnya! Unduh persis commit-commit yang ditunjukkan gambar target. Silakan pamer perintah keren!',
              '',
              'Kamu harus menyebutkan asal dan tujuan untuk kedua perintah fetch-nya. Perhatikan baik-baik gambar targetnya, karena nama commit-nya bisa tertukar!',
            ],
          },
        },
      ],
    },
  },

  sourceNothing: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '### Keanehan `<asal>`',
              '',
              'Git memakai bagian `<asal>` untuk dua hal yang agak aneh. Keanehan ini muncul karena kamu boleh menulis "kosong" sebagai asal, baik untuk push maupun fetch.',
              '',
              'Caranya: kosongkan saja bagian sebelum titik dua.',
              '',
              '* `git push origin :side`',
              '* `git fetch origin :bugFix`',
              '',
              'Ayo lihat apa yang terjadi...',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Apa jadinya kalau kita mengirim "kosong" ke sebuah cabang di remote? Cabangnya **dihapus**!',
            ],
            afterMarkdowns: [
              'Nah, cabang `foo` di remote berhasil dihapus, cuma dengan mengirimkan "kekosongan" ke sana. Lumayan masuk akal juga...',
            ],
            command: 'git push origin :foo',
            beforeCommand: 'git fakeCreateRemote; git push origin main:foo',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Sebaliknya, mengunduh "kosong" ke sebuah tempat di komputermu malah **membuat cabang baru**.',
            ],
            afterMarkdowns: ['Aneh sekali ya, tapi ya sudahlah. Begitulah Git!'],
            command: 'git fetch origin :bar',
            beforeCommand: 'git fakeCreateRemote',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Level ini singkat kok. Hapus satu cabang di remote, lalu buat satu cabang baru pakai `git fetch`. Selesai!',
            ],
          },
        },
      ],
    },
  },

  pullArgs: {
    startDialog: {
      childViews: [
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Argumen git pull',
              '',
              'Sekarang kamu sudah tahu hampir **semua** tentang argumen `git fetch` dan `git push`. Jadi hampir tidak ada yang tersisa untuk `git pull`. :)',
              '',
              'Kenapa? Karena `git pull` itu ujung-ujungnya cuma singkatan dari: fetch dulu, lalu gabungkan apa yang barusan diunduh.',
              '',
              'Anggap saja dia menjalankan `git fetch` dengan argumen yang **sama**, lalu menggabungkan dari **tempat commit itu mendarat**.',
              '',
              'Ini berlaku bahkan untuk argumen yang rumit sekalipun. Ayo lihat contohnya:',
            ],
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              'Ini pasangan perintah yang artinya sama persis:',
              '',
              '`git pull origin foo` sama dengan:',
              '',
              '`git fetch origin foo; git merge o/foo`',
              '',
              'Lalu...',
              '',
              '`git pull origin bar:bugFix` sama dengan:',
              '',
              '`git fetch origin bar:bugFix; git merge bugFix`',
              '',
              'Lihat kan? `git pull` memang cuma singkatan dari fetch + merge. Yang dia pedulikan cuma satu: di mana commit-nya mendarat waktu fetch tadi.',
              '',
              'Ayo lihat contohnya:',
            ],
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: [
              'Kalau kita menyebut tempat yang mau di-fetch, semuanya berjalan seperti fetch biasa, lalu hasilnya digabungkan.',
            ],
            afterMarkdowns: [
              'Lihat! Dengan menyebut `main`, commit-nya turun ke `o/main` seperti biasa. Lalu `o/main` digabungkan ke tempat kita berdiri sekarang -- yang **bukan** cabang `main`.',
              '',
              'Karena itu, kadang masuk akal menjalankan git pull berkali-kali dengan argumen yang sama dari cabang berbeda-beda, supaya beberapa cabang ikut diperbarui.',
            ],
            command: 'git pull origin main',
            beforeCommand: 'git fakeCreateRemote; go -b bar; git commit; git fakeTeamwork',
          },
        },
        {
          type: 'GitDemonstrationView',
          options: {
            beforeMarkdowns: ['Apakah bisa pakai asal dan tujuan juga? Bisa dong! Ayo lihat:'],
            afterMarkdowns: [
              'Wow, banyak sekali yang terjadi cuma dari satu perintah! Kita membuat cabang lokal baru bernama `foo`, mengunduh commit dari `main` milik remote ke cabang itu, lalu menggabungkan `foo` ke cabang yang sedang kita tempati, yaitu `bar`.',
            ],
            command: 'git pull origin main:foo',
            beforeCommand: 'git fakeCreateRemote; git fakeTeamwork; go -b bar; git commit',
          },
        },
        {
          type: 'ModalAlert',
          options: {
            markdowns: [
              '## Misi kamu',
              '',
              'Terakhir nih! Capailah keadaan seperti gambar target.',
              '',
              'Kamu perlu mengunduh beberapa commit, membuat cabang baru, dan menggabungkan cabang ke cabang lain. Tapi tenang, tidak butuh banyak perintah kok. :P',
            ],
          },
        },
      ],
    },
  },
};
