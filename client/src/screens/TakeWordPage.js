import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard , Alert} from 'react-native';
import SocketContext from '../../SocketContext';


const TakeWordPage = ({ route, navigation }) => {

  const { user, harfSabiti, oyunModu , odaIsmi, socketId} = route.params;
  const [userWord, setUserWord] = useState(Array(oyunModu).fill(''));
  const [timer, setTimer] = useState(60);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Oyunun başladığı bilgisini tutacak durum değişkeni
  const [opponentWords, setOpponentWords] = useState({}); // Rakibin kelimelerini tutacak durum değişkeni

  const socket = useContext(SocketContext);
  // Kelime gönderme fonksiyonu
  const sendWord = (word) => {
    // Oda ismi ve kelime ile sunucuya kelime gönderin
    socket.emit('kelimeGonder', { odaIsmi: odaIsmi, kelime: word });
  };

  // Zamanlayıcı bitiminde çağırılacak fonksiyon
  const handleTimeout = () => {
    // Oda ismi ile sunucuya zaman aşımı bildirin
    console.log("handleTimeout")
    socket.emit('zamanAsimi', odaIsmi);
    
  };
  

  const handleLetterChange = (text, index) => {
    const updatedUserWord = [...userWord];
    updatedUserWord[index] = text;
    setUserWord(updatedUserWord);
    // Son input harf girildikten sonra klavyeyi kapat
    if (index === oyunModu - 1) {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    // Oyun başlatma event'ini dinle
    socket.on('oyunBaslat', (kelimeler) => {
      // Server'dan gelen kelime bilgilerini ayarla
      console.log("kelimeler: " , kelimeler)

      setOpponentWords(kelimeler);
      // Oyun başlatıldığını belirle
      setGameStarted(true);
    });


    socket.on('oyunuKazandin', () => {
      console.log('oyunuKazandin')
      Alert.alert(
        'Tebrikler',
        'Rakibiniz süresi içinde kelimeyi onaylamadı, oyunu kazandınız!',
        [
          {
            text: "Tamam",
            onPress: () => navigation.navigate('Second',  { user: user, harfSabiti: true }),  // Kullanıcı alert'e tepki verdiğinde 'Second' sayfasına yönlendir
          }
        ]
      );

      console.log('oyunuKazandin')
      // Oyun kazanıldığında yapılacak işlemler
    });
  
    socket.on('oyunuKaybettin', () => {
      console.log('oyunuKaybettin')
      Alert.alert(
        'Üzgünüm',
        'Süre doldu, oyunu kaybettiniz.',
        [
          {
            text: "Tamam",
            onPress: () => navigation.navigate('Second',  { user: user, harfSabiti: true }),  // Kullanıcı alert'e tepki verdiğinde 'Second' sayfasına yönlendir
          }
        ]
      );

      console.log('oyunuKaybettin')
      // Oyun kaybedildiğinde yapılacak işlemler
    });
  

    return () => {
      // Component unmount olduğunda event listener'ı temizle
      socket.off('oyunBaslat');
      socket.off('oyunuKazandin');
      socket.off('oyunuKaybettin');
    };
  }, [socket]);





  useEffect(() => {
    if (timer > 0 && !isConfirmed) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    }
    if (timer === 0 && !isConfirmed) {
      handleTimeout();
    }
  }, [timer, isConfirmed]);
  
  const handleWordSubmit = async () => {
    if (userWord.length !== oyunModu) {
      alert(`Kelimeniz tam olarak ${oyunModu} harf olmalıdır.`);
      return;
    }
    // Burada sözlük API'si veya kelime listesi kontrolü yapabilirsiniz
    // Örneğin, kelimenin geçerli olup olmadığını kontrol etmek için bir API çağrısı yapın
    const isValidWord = await checkWordValidity(userWord);
    if (!isValidWord) {
      alert('Geçerli bir kelime girin.');
      return;
    }
    if (isValidWord) {
      sendWord(userWord);
    }
    setIsConfirmed(true); // Oyuncunun kelimeyi onayladığını belirleyin

    // if (isValidWord) {
    //   sendWord(userWord.join(''));
    //   setIsConfirmed(true); // Oyuncunun kelimeyi onayladığını belirle
    //   // Oyun bilgileri ile birlikte GamePage'e yönlendir
    //   navigation.navigate('Game', {
    //     user: user,
    //     harfSabiti: harfSabiti,
    //     oyunModu: oyunModu,
    //     odaIsmi: odaIsmi,
    //     userWord: userWord.join('') // Kullanıcı kelimesini string olarak gönder
    //   });
    // }

    // ...Diğer işlemler
  };


  // useEffect(() => {
  //   if (gameStarted) {
  //     // console.log("Game starting...");
  //     console.log("buraya geliyor mu")

  //       navigation.reset({
  //       index: 0,
  //       routes: [
  //         {
  //           name: 'Game',
  //           params: { user: user,
  //             harfSabiti: harfSabiti,
  //             oyunModu: oyunModu,
  //             odaIsmi: odaIsmi,
  //             socketId: socketId,
  //             Words: opponentWords, // Kullanıcı kelimesini string olarak gönder
  //             remainingTime: timer,}
  //         }
  //       ],
  //     });

  //     // Oyun başlatıldıktan sonra gameStarted durumunu false yaparak tekrar tetiklenmesini önleyin.
  //     setGameStarted(false);
  //   }
  // }, [gameStarted]);  // Bağımlılıklar listesine gameStarted ekleyin.
  
  // Oyun başlatıldığında gameStarted durumunu true yapın
  // const startGame = () => {
  //   setGameStarted(true);
  // };
  

  if (gameStarted) {
    
    console.log("parametreler",user,harfSabiti,oyunModu,odaIsmi,socketId,opponentWords,timer)

    console.log("Gameeee")
      navigation.navigate('Game', {
        user: user,
        harfSabiti: harfSabiti,
        oyunModu: oyunModu,
        odaIsmi: odaIsmi,
        socketId: socketId,
        Words: opponentWords, // Kullanıcı kelimesini string olarak gönder
        remainingTime: timer,
      });


      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name: 'Game',
      //       params: { user: user,
      //         harfSabiti: harfSabiti,
      //         oyunModu: oyunModu,
      //         odaIsmi: odaIsmi,
      //         socketId: socketId,
      //         Words: opponentWords, // Kullanıcı kelimesini string olarak gönder
      //         remainingTime: timer,}
      //     }
      //   ],
      // });

    setGameStarted(false);

  }
  
  const checkWordValidity = async (word) => {
    // Sözlük kontrolü için API çağrısı yapılacak
    // Bu örnek için sadece true döndürüyoruz, gerçek uygulamada burada API kontrolü olacak
    return true; // Geçici olarak her kelimeyi geçerli kabul ediyoruz
  };


  if (isConfirmed) {
    // Burada tahmin ekranı ve mantığı olacak
    return <View style = {styles.container}>
              <Text>Rakip bekleniyor!</Text>
          </View>;
  }

  const textInputs = userWord.map((letter, index) => (
    <TextInput
      key={index}
      style={styles.letterInput}
      onChangeText={(text) => handleLetterChange(text, index)}
      value={letter}
      maxLength={1}
      returnKeyType={index === oyunModu - 1 ? 'done' : 'next'}
      onSubmitEditing={() => {
        // Bir sonraki input'a geçiş
        if (index < oyunModu - 1) {
          // inputRefs diye bir referansınız yok ama bu bir sonraki input'a odaklanmayı tetikler
        }
      }}
      blurOnSubmit={index === oyunModu - 1}
    />
  ));

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text>{`Kalan süre: ${timer}`}</Text>
      </View>
      <View style={styles.inputContainer}>{textInputs}</View>
      <TouchableOpacity onPress={handleWordSubmit} style={styles.button}>
        <Text>Onayla</Text>
      </TouchableOpacity>
    </View>
  );



  // return (
  //   <View style={styles.container}>
  //     <View style={styles.timerContainer}>
  //       <Text>{`Kalan süre: ${timer}`}</Text>
  //     </View>
  //     <TextInput
  //       style={styles.input}
  //       onChangeText={setUserWord}
  //       value={userWord}
  //       maxLength={oyunModu}
  //       placeholder={`${oyunModu} harfli kelime gir`}
  //     />
  //     <TouchableOpacity onPress={handleWordSubmit} style={styles.button}>
  //       <Text>Onayla</Text>
  //     </TouchableOpacity>
  //   </View>
  // );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    width: '80%',
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
  },inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Gerekli diğer stil ayarlamaları
  },
  letterInput: {
    borderWidth: 1,
    borderColor: 'gray',
    width: 40,
    height: 40,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 20,
    // Gerekli diğer stil ayarlamaları
  },

});

export default TakeWordPage;
