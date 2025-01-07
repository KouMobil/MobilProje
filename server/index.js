const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Burası istemcinizin çalıştığı adrese göre güncellenmelidir.
    methods: ['GET', 'POST']
  }
});

const lobiler = {}; // Oda isimlerine göre kullanıcıları tutacak nesne
const oyuncuKelimeleri = {}; // Oyuncu kelimelerini saklayacak obje, dizi değil
let odaIsmiState = null;
let SocketIdState = null;
const scores = {};
const screens = {};  // Oyuncuların ekran görüntülerini saklamak için
const playerStatuses = {};



io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a player joins a game or returns to the lobby, update their status
socket.on('updateStatus', ({ userId, status }) => {
  playerStatuses[userId] = status;
  // Broadcast the updated statuses to all clients in the lobby
  io.emit('statusUpdate', playerStatuses);
});


socket.on('sendScore', (data) => {
  // console.log("1")

  if (!scores[data.room]) {
    scores[data.room] = {};
  }
  if (!screens[data.room]) {
    screens[data.room] = {};
  }

  // console.log(data.score)
  // console.log(socket.id)

  scores[data.room][socket.id] = data.score;
  screens[data.room][socket.id] = data.screenData;

  // console.log("data.score: " ,data.score)
  // console.log("data.screenData: " ,data.screenData)

  const playersInRoom = io.sockets.adapter.rooms.get(data.room);
  // console.log(playersInRoom)
  // if (playersInRoom && playersInRoom.size === Object.keys(scores[data.room]).length) {
  //   // Tüm skorlar alındı, karşılaştırma yap
  //   compareScoresAndAnnounceWinner(data.room);
  // }
  // console.log('Ekran Görüntüsü1:', screens[data.room][socket.id]);  // Ekran görüntüsünü loglayın

  // console.log("players lengt: " , Object.keys(scores[data.room]).length)
  // console.log("playersInRoom: " , playersInRoom)

  // if (playersInRoom && playersInRoom.size === Object.keys(scores[data.room]).length) {            //hatalı  
  // console.log("lengt: ",Object.keys(scores[data.room]).length)
    if(Object.keys(scores[data.room]).length === 2 ){       
    // Tüm skorlar ve ekran görüntüleri alındığında sonuçları gönder
    const opponentId = findOpponentId(data.room, socket.id)
    io.to(socket.id).emit('scoreData', {
      scores: scores[data.room],
      screens: screens[data.room],
      opponentId: opponentId
    });
    // console.log('Ekran Görüntüsü2:', screens[data.room][socket.id]);  // Ekran görüntüsünü loglayın

    // Her iki oyuncuya da score ekranını göster
    // io.to(data.room).emit('navigateToScore');

    const playerScores = Object.entries(scores[data.room]).map(([socketId, score]) => ({ socketId, score }));

    playerScores.forEach(player => {
      delete scores[data.room][player.socketId];
    });

    }
});

socket.on('navigateToScoreEmit', (data) => {
  // console.log("index player score: ",data.playerScore )
  // console.log("index opponent score: ",data.opponentScore )

    io.to(socket.id).emit('navigateToScore', { room: data.room, letPlayerScreen : data.letPlayerScreen, letOpponentScreen: data.letOpponentScreen, playerScore: data.playerScore, opponentScore: data.opponentScore });
    io.to(data.opponentId).emit('navigateToScore', { room: data.room, letPlayerScreen : data.letOpponentScreen, letOpponentScreen: data.letPlayerScreen, playerScore: data.opponentScore, opponentScore: data.playerScore });
});


const compareScoresAndAnnounceWinner = (room) => {
  const playerScores = Object.entries(scores[room]).map(([socketId, score]) => ({ socketId, score }));
  if (playerScores.length === 2) {
    const [player1, player2] = playerScores;
    let winnerInfo;
    if (player1.score > player2.score) {
      winnerInfo = { winner: player1.socketId, loser: player2.socketId };
    } else if (player2.score > player1.score) {
      winnerInfo = { winner: player2.socketId, loser: player1.socketId };
    } else {
      // Eğer skorlar eşitse, beraberlik olduğunu belirt.
      winnerInfo = { draw: true };
    }

    // Sonuçları herkese gönder
    io.to(room).emit('announceWinner', { winnerInfo, scores: playerScores });

    // Skorları sıfırla, bir sonraki oyun için.
    playerScores.forEach(player => {
      delete scores[room][player.socketId];
    });

    // Sonrasında navigate event'ini gönderin
    // io.to(room).emit('navigateToSecondPage');
  } else {
    // Tüm oyuncuların skorları henüz alınmadıysa, bir hata mesajı gönderin.
    console.error('Skorlar karşılaştırılamıyor, tüm skorlar henüz alınmadı.');
  }
};









  socket.on('sendScreenData', (data) => {
    const { screenData, roomName } = data;
    // Burada bir örnek olarak, ekran görüntüsünü aynı odadaki diğer kullanıcılara gönderiyoruz
    // Not: Gerçek uygulamanızda, oda yönetimini ve kullanıcı kimliklerini doğru şekilde yönettiğinizden emin olun.
    // const roomName = "ÖrnekOdaIsmi"; // Gerçek uygulamanızda bu dinamik olmalı
    // console.log("room Name: " , roomName)

    socket.to(roomName).emit('receiveScreenData', { screenData });

  });


  const calculateScore = (inputMatrix, remainingTime) => {
    let score = remainingTime; // remainingTime başlangıçta puan olarak eklenir.
  
    inputMatrix.forEach(row => {
      row.forEach(({ color }) => {
        if (color === 'green') {
          score += 10; // Yeşil kutular için puan eklenir.
        } else if (color === 'orange') {
          score += 5; // Sarı kutular için puan eklenir.
        }
      });
    });
  
    return score;
  };
  


  socket.on('oyunBitti', ({kazanan, odaIsmi }) => {
    // Kazananı herkese (bu durumda odadaki diğer kullanıcıya) bildir
    io.to(odaIsmi).emit('oyunBittiGosterme', { kazanan: kazanan });
    // Oda içindeki herkese (kazanan ve kaybeden) oyunun bittiğini ve SecondPage.js sayfasına gitmeleri gerektiğini bildir
    // io.to(odaIsmi).emit('navigateToSecondPage');
  });

  
  // Kullanıcı oda seçtiğinde
  socket.on('odaSec', ({ harfSabiti, oyunModu, email }) => {
    const odaIsmi = `${oyunModu}_${harfSabiti}`;
    socket.join(odaIsmi);
    if (!lobiler[odaIsmi]) {
      lobiler[odaIsmi] = [];
    }
    // Kullanıcı bilgilerini içeren nesneyi oda listesine ekle
    lobiler[odaIsmi].push({ id: socket.id, email: email });

    // Oda listesini o odadaki herkese yayınla
    // console.log('Gelen kullanıcılar:', lobiler[odaIsmi]); // Bu satırı ekleyin.

    io.to(odaIsmi).emit('lobiKullanicilari', lobiler[odaIsmi]);
  });


  // Bir oyuncu kelime gönderdiğinde
  socket.on('kelimeGonder', ({ odaIsmi, kelime }) => {
    // Oyuncunun kelimesini saklayın
    if (!oyuncuKelimeleri[odaIsmi]) {
      oyuncuKelimeleri[odaIsmi] = {};
    }
    oyuncuKelimeleri[odaIsmi][socket.id] = kelime;
    console.log(odaIsmi,kelime, oyuncuKelimeleri[odaIsmi], socket.id)

    // Eğer her iki oyuncu da kelime gönderdiyse
    console.log("oyuncuKelime: ", Object.keys(oyuncuKelimeleri[odaIsmi]).length)
    if (Object.keys(oyuncuKelimeleri[odaIsmi]).length === 2) {
      // Oyunu başlat
      // console.log("oyunu başlat")
      console.log("oyun baslat")
      console.log("oyuncu kelimeleri",oyuncuKelimeleri[odaIsmi])
      io.to(odaIsmi).emit('oyunBaslat', oyuncuKelimeleri[odaIsmi]);
      console.log("oyun baslat 22")

    } else {
      // Diğer oyuncuya bilgi ver
      socket.to(odaIsmi).emit('bekleme', 'Rakibinizin kelime onayını bekleyin...');
    }
  });

  socket.on('oyundanCikisYapti', ({ odaIsmi, userId }) => {
    // Oda'daki diğer kullanıcıya bilgi gönder
    socket.to(odaIsmi).emit('rakipOyunuTerkEtti', { message: 'Rakibiniz oyunu terk etti.' });
  
    // Kullanıcının ayrıldığı odayı ve bilgilerini güncelle
    lobiler[odaIsmi] = lobiler[odaIsmi].filter(user => user.id !== userId);
    if (lobiler[odaIsmi].length === 0) {
      delete lobiler[odaIsmi];
    }
  
    // Eğer oyuncu kelimeleri içinde bu kullanıcı varsa sil
    if (oyuncuKelimeleri[odaIsmi] && oyuncuKelimeleri[odaIsmi][userId]) {
      delete oyuncuKelimeleri[odaIsmi][userId];
    }
  });
  

  // Oyuncu zaman aşımında oyunu kaybetti
  socket.on('zamanAsimi', (odaIsmi) => {
    console.log("odaIsmi", odaIsmi)

    const players = lobiler[odaIsmi];

    console.log("players", players)


    if (players && players.length > 0) {

      console.log("players", players)

      const opponent = players.find(player => player.id !== socket.id);

      console.log("opponent", opponent.id)
      console.log("socket", socket.id)

      if (opponent) {
        io.to(opponent.id).emit('oyunuKazandin');
        io.to(socket.id).emit('oyunuKaybettin');
      }
    }
  });

  // index.js'de bir oyuncu rakibinin ekranını istediğinde
  socket.on('rakibinEkraniIste', ({ odaIsmi }) => {
    // Rakibin socket ID'sini bul

    const opponentId = findOpponentId(odaIsmi, socket.id);
    // console.log("opponent Id: ",opponentId)
    // Rakibe, ekranını isteyen oyuncu için ekranını göndermesini iste
    socket.to(opponentId).emit('rakibinEkraniIste', { istekYapanId: socket.id });
  });

  socket.on('rakibinEkraniIste', async (data) => {
    try {
      const screenData = await getMyScreenData();
      socket.emit('rakibinEkraniGonder', { istekYapanId: data.istekYapanId, screenData });
    } catch (error) {
      console.error("Ekran verisi alınamadı", error);
    }
  });
  

  // Rakibin ekranını göndermek için
  socket.on('rakibinEkraniGonder', ({ istekYapanId, screenData }) => {
    // İstekte bulunan oyuncuya rakibin ekranını gönder
    socket.to(istekYapanId).emit('rakibinEkraniGuncelle', screenData);
  });

  function findOpponentId(odaIsmi, currentSocketId) {
    // Oda içerisindeki kullanıcılar listesini al
    const players = lobiler[odaIsmi];
    // Mevcut kullanıcı hariç diğer kullanıcıyı bul
    const opponent = players.find(player => player.id !== currentSocketId);
    // Rakibin socket.id değerini döndür
    return opponent ? opponent.id : null;
  }

  socket.on('requestOpponentScreen', ({ socketId, odaIsmi }) => {
    // Rakibe ekran görüntüsü gönderme isteği yolla
    odaIsmiState = odaIsmi;
    SocketIdState = socketId;
    const opponentSocketId = findOpponentId(odaIsmi, socketId)
    io.to(opponentSocketId).emit('captureScreenRequest');

  });

  // Rakibin ekran görüntüsünü alıp geri gönderme
  socket.on('sendScreenData', ({ screenData }) => {
 findOpponentId(odaIsmiState, SocketIdState); // Bu fonksiyonu tanımlamanız gerekecek.
    io.to(SocketIdState).emit('updateOpponentScreen', { screenData });
  });

  socket.on('odadanAyril', (odaIsmi) => {
    // Socket'i oda listesinden çıkarmak için
    socket.leave(odaIsmi);

    // lobiler[odaIsmi] listesindeki her kullanıcı için, socket.id'si eşleşmeyenleri filtrele
    lobiler[odaIsmi] = lobiler[odaIsmi].filter(user => user.id !== socket.id);

    // Güncellenmiş kullanıcı listesini o odadaki diğer kullanıcılara yayınla
    io.to(odaIsmi).emit('lobiKullanicilari', lobiler[odaIsmi]);

    // Eğer kullanıcı listesi boşsa, oda listesinden bu odayı kaldır
    if (lobiler[odaIsmi].length === 0) {
        delete lobiler[odaIsmi];
    }

    console.log(`User left room: ${odaIsmi}, remaining users: ${lobiler[odaIsmi] ? lobiler[odaIsmi].length : 0}`);

    if (oyuncuKelimeleri[odaIsmi]) {
      delete oyuncuKelimeleri[odaIsmi][socket.id];
    }
  });

  socket.on('disconnect', () => {
    // socket.rooms içinde döngü yaparak kullanıcıyı her odadan çıkar
    Object.keys(socket.rooms).forEach((room) => {
      // room değeri, socket.id'ye eşit olmayan bir oda ismi ise bu odayla ilgili işlem yap.
      // socket.io v2 ve v3'te socket kendisinin de bir odası olarak kabul edilir.
      if (socket.id !== room) {
        // Oda ismine göre kullanıcı listesini güncelle
        lobiler[room] = (lobiler[room] || []).filter(userId => userId !== socket.id);
        // O odadaki kalan kullanıcılara güncellenmiş listeyi yayınla
        io.to(room).emit('lobiKullanicilari', lobiler[room]);
      }
    });
    console.log(`User disconnected: ${socket.id}`);

    let oda = ""
    // Oyuncunun tüm odalardan kelimelerini silin
    Object.keys(oyuncuKelimeleri).forEach((odaIsmi) => {
      oda = odaIsmi
      if (oyuncuKelimeleri[odaIsmi][socket.id]) {
        delete oyuncuKelimeleri[odaIsmi][socket.id];
      }
    });


    socket.to(oda).emit('rakipOyunuTerkEtti', { message: 'Rakibiniz oyunu terk etti.' });


    if (playerStatuses[socket.id]) {
      delete playerStatuses[socket.id];
      io.emit('statusUpdate', playerStatuses);
    }
    

  });

  socket.on('oyunIstegiGonder', (data) => {
    // 'to' ID'sine sahip soketi bul ve ona oyun isteğini gönder
    console.log(`oyunIstegiGonder: from ${data.fromId} to ${data.to}`);
    io.to(data.to).emit('oyunIstegi', { fromId: data.fromId, fromUsername: data.fromUsername,to: data.to });
  });


  socket.on('oyunIstegiGonderScorePage', (data) => {
    // 'to' ID'sine sahip soketi bul ve ona oyun isteğini gönder
    const opponentId = findOpponentId(data.odaIsmi, data.fromId);
    console.log(`DuelloIstegiGonder: from ${data.fromId} to ${opponentId}`);
    io.to(opponentId).emit('oyunIstegiScorePage', { fromId: data.fromId,to: opponentId });
  });


  // Kullanıcı oyun isteğine cevap verdiğinde
  // socket.on('oyunIstegiCevap', ({ from, to, cevap }) => {
  //   // 'from' ID'sine sahip soketi bul ve ona cevabı gönder
  //   console.log("oyunIstegiCevap: ",from,to, cevap)

  //   io.to(from).emit('oyunIstegiCevap', { from: to, cevap });
  // });

  socket.on('oyunIstegiCevap', ({ from, to, cevap }) => {
    console.log("from:", from , " to: " , to)
    if (cevap === 'kabul') {
      // Her iki kullanıcıya da oyunun başladığını bildir
      io.to(from).emit('oyunBasladi');
      io.to(to).emit('oyunBasladi');
    }else{
      io.to(to).emit('redAlert');
    }
    // ... (kalan kodlar)
  });


  socket.on('oyunIstegiCevapScorePage', ({ from, to, cevap , room}) => {
    console.log("from:", from , " to: " , to)
    if (cevap === 'kabul') {
      // Her iki kullanıcıya da oyunun başladığını bildir
      io.to(from).emit('oyunBasladiScorePage');
      io.to(to).emit('oyunBasladiScorePage');
    }else{
      io.to(to).emit('redAlert');
    }
    // ... (kalan kodlar)
  });
});

const PORT = 8080;
//const HOST = '172.20.10.4'; // Sunucunuzun IP adresi

/*
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
*/
server.listen(PORT, '172.20.10.4', () => {
  console.log(`Server is running on port ${PORT}`);
});