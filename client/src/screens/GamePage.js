import React, { useState,useEffect, useContext} from 'react';
import { StyleSheet, View, TextInput, Text, Alert, TouchableOpacity, Image } from 'react-native';
import { captureScreen } from "react-native-view-shot";
import SocketContext from '../../SocketContext';
import { data } from 'autoprefixer';
import { getActionFromState } from '@react-navigation/native';


const GamePage = ({ route, navigation }) => {
  const socket = useContext(SocketContext);

  const { user, harfSabiti, oyunModu,Words , socketId, remainingTime} = route.params;
  const [inactiveTimer, setInactiveTimer] = useState(null);
  const [warningTimer, setWarningTimer] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [bool1, setbool] = useState(true);
  // const [opponentScreenUri, setOpponentScreenUri] = useState(null);
  
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentScreen, setOpponentScreen] = useState();
  const [playerScreen, setPlayerScreen] = useState();
  let letPlayerScreen = null
  let letOpponentScreen = null


  useEffect(() => {
    // Başlangıç durumlarını sıfırla
    setInactiveTimer(null);
    setWarningTimer(null);
    setSecondsLeft(10);
    setbool(true);
    setPlayerScore(0);
    setOpponentScore(0);
    setOpponentScreen(null);
    setPlayerScreen(null);
    setUserInput(Array(oyunModu).fill('').map(() => Array(oyunModu).fill({ value: '', color: 'white' })));
    setGuessCount(0);
    setShowAlert({ show: false, message: '' });
  
    // İlgili socket dinleyicilerini temizle veya yeniden ayarla
    const existingListener = socket.hasListeners('rakipOyunuTerkEtti');
    if (existingListener) {
      socket.off('rakipOyunuTerkEtti');
    }
  
    socket.on('rakipOyunuTerkEtti', (data) => {
      Alert.alert("Rakip Oyunu Terk Etti", "Oyunu kazandınız!");
      navigation.navigate('Second', { user: user, harfSabiti: true });
    });
  
    return () => {
      // Clean up: Socket dinleyicilerini ve timer'ları temizle
      socket.off('rakipOyunuTerkEtti');
      clearTimeout(inactiveTimer);
      clearTimeout(warningTimer);
    };
  }, [socket, navigation, user, harfSabiti, oyunModu]); // Bağımlılıkları güncelle

  
  const opponentWordDisplay = (opponentWords, socketId) => {
    // Mevcut kullanıcının ID'si dışındaki tüm playerId'leri filtrele
    const opponents = Object.entries(opponentWords).filter(([playerId, _]) => playerId !== socketId);
  
    if (opponents.length > 0) {
      const [playerId, word] = opponents[0];
  
      // Seçilen rakibin playerId ve word değerlerini döndür
      return word;
    } else {
      // Uygun rakip bulunamazsa null döndür
      return null;
    }
  }

  opponentWord =  opponentWordDisplay(Words, socketId)

  const sendGameData = async () => {
    const uri = await captureScreen({
      format: "jpg",
      quality: 0.8
    });
    // console.log('Ekran görüntüsü URI:', uri);  // Ekran görüntüsünün URI'sini kontrol et
    const score = calculateScore(userInput, remainingTime);
    socket.emit('sendScore', { score: score, screenData: uri, room: odaIsmi });
  };
  
  useEffect(() => {
    // Eğer harfSabiti true ise ve bir opponentWord var ise
    if (harfSabiti && opponentWord) {
      const randomIndex = Math.floor(Math.random() * opponentWord.length); // Rakibin kelimesinden rastgele bir index seç
      const randomLetter = opponentWord[randomIndex]; // Seçilen harfi al
  
      setUserInput(currentInput => {
        const newInput = [...currentInput]; // mevcut userInput durumunun bir kopyasını oluştur
        newInput[0][randomIndex] = { ...newInput[0][randomIndex], value: randomLetter}; // İlk satırdaki rastgele bir hücreye harfi ata
        return newInput; // Yeni durumu döndür
      });
    }
  }, [harfSabiti, opponentWord]); // Bağımlılıklar olarak harfSabiti ve opponentWord kullan

  
  useEffect(() => {
    
  
    socket.on('scoreData', (data) => {
      // console.log("2")
      // console.log("Alınan skorlar: ", data.scores);
      // console.log("Alınan ekran görüntüleri: ", data.screens);
      // console.log("scores: ",data.scores)
          
      if (data.scores && data.screens) {
        setPlayerScore(data.scores[socket.id])
        setOpponentScore(data.scores[data.opponentId])
        letPlayerScreen = data.screens[socket.id]
        letOpponentScreen = data.screens[data.opponentId]

        // console.log("scores: " , data.scores)
        // console.log("screens: " , data.screens)

        


        socket.emit('navigateToScoreEmit', { room: odaIsmi, socketId: socket.id, opponentId: data.opponentId, letPlayerScreen : letPlayerScreen, letOpponentScreen: letOpponentScreen, playerScore : data.scores[socket.id], opponentScore: data.scores[data.opponentId] });

      }

    });

    
  
    return () => {
      // socket.off('navigateToScore');
      socket.off('scoreData');
    };
  }, [socket, navigation]);


  useEffect(() => {
    // if(bool1){
      // setbool(false)
      // Define a function to handle the navigation
      // const handleNavigationToScore = () => {
      //   // console.log("playerScore: ", playerScore);
      //   // console.log("opponentScore: ", opponentScore);
      //   // console.log("player Screen: ", letPlayerScreen);
      //   // console.log("opponent Screen: ", letOpponentScreen);

      //   navigation.navigate('Score', {
      //     userScore: playerScore,
      //     opponentScore: opponentScore,
      //     userScreen: letPlayerScreen,
      //     opponentScreen: letOpponentScreen,
      //     socketId: socketId // Only pass socketId once
      //   });
      // };
    
      // Add event listener
      socket.on('navigateToScore', (data) => {

        // console.log("data: ", data)

        navigation.navigate('Score', {
          userScore: data.playerScore,
          opponentScore: data.opponentScore,
          userScreen: data.letPlayerScreen,
          opponentScreen: data.letOpponentScreen,
          socketId: socketId, // Only pass socketId once
          odaIsmi : odaIsmi,
          harfSabiti: harfSabiti,
          oyunModu: oyunModu,
          user: user
        });

      });
    
      // Clean up the effect
      return () => {
        // socket.off('navigateToScore', handleNavigationToScore);
      };
    // }
  }, [playerScore]); // Add the scores as dependencies

  

  useEffect(() => {
    // Eğer zaten bir event listener varsa, onu temizle.
    const existingListener = socket.hasListeners('rakipOyunuTerkEtti');
    if (existingListener) {
      socket.off('rakipOyunuTerkEtti');
    }
  
    // Socket event listener'ı tanımla
    const handleRakipOyunuTerkEtti = (data) => {
      Alert.alert("Rakip Oyunu Terk Etti", "Oyunu kazandınız!");
      // LobiPage'e geri dön
      navigation.navigate('Second', { user: user, harfSabiti: true });
    };
  
    // Yeni event listener'ı bağla
    socket.on('rakipOyunuTerkEtti', handleRakipOyunuTerkEtti);
  
    // Cleanup fonksiyonu
    return () => {
      // Event listener'ı kaldır
      socket.off('rakipOyunuTerkEtti', handleRakipOyunuTerkEtti);
    };
  }, [socket]); // Bağımlılıklarınızı burada belirtin
  

  const handleExitGameConfirmed = () => {
    // Server'a oyunu terk ettiğini söyle
    const odaIsmi = `${oyunModu}_${harfSabiti}`; // Örnek oda ismini oluşturuyoruz
    socket.emit('oyundanCikisYapti', { odaIsmi: odaIsmi, userId: socketId });

    // LobiPage ekranına dön
    navigation.navigate('Second', {user: user, harfSabiti: true});
  };

  

  useEffect(() => {
    // 1 dakika sonra uyarı başlat
    setInactiveTimer(setTimeout(() => startWarning(), 60000));

    // Cleanup fonksiyonu
    return () => {
      clearTimeout(inactiveTimer);
      clearTimeout(warningTimer);
    };
  }, []);

  const resetInactiveTimer = () => {
    // Eğer bir uyarı başlamışsa, sayımı durdur
    if (warningTimer) {
      clearTimeout(warningTimer);
      setWarningTimer(null);
      setSecondsLeft(10);
    }
    // Kullanıcı aktivitesi olduğunda timer'ı sıfırla
    clearTimeout(inactiveTimer);
    setInactiveTimer(setTimeout(() => startWarning(), 60000));
  };

  const startWarning = () => {
    // 10 saniyelik sayımı başlat
    setSecondsLeft(10);
    setWarningTimer(setInterval(() => setSecondsLeft(seconds => seconds - 1), 1000));
  };

  useEffect(() => {
    // Eğer sayım biterse, kullanıcıyı mağlup et
    if (secondsLeft <= 0) {
      clearInterval(warningTimer);
      // Kullanıcı mağlup edildi işlemini burada yapın
      Alert.alert("Süre doldu", "Mağlup oldunuz!");
    }
  }, [secondsLeft]);

  const handleExitGame = () => {
    Alert.alert(
      "Oyundan Çık",
      "Oyundan çıkmanız halinde oyunu kaybedeceksiniz. Çıkmak istiyorsanız onay butonuna basınız",
      [
        // İptal butonu
        { text: "Reddet", style: "cancel" },
        // Onay butonu
        { text: "Onayla", onPress: handleExitGameConfirmed }
      ],
      { cancelable: false }
    );
  };

  // Rakibi göster butonu için event handler
const viewOpponentScreen = () => {
    socket.emit('requestOpponentScreen', { socketId , odaIsmi});
};

useEffect(() => {
  socket.on('updateOpponentScreen', (data) => {
    const { screenData } = data;
    // setOpponentScreenUri(screenData);
    navigation.navigate('Opponent', { screenData: screenData, socket: socket });


  });

  // Clean up the effect when leaving the component
  // return () => {
  //   socket.off('updateOpponentScreen');
  // };
}, [socket]);

// Ekran görüntüsü alma işlemi
const captureAndSendScreen = async () => {
  try {
    const uri = await captureScreen({
      format: "jpg",
      quality: 0.8
    });
    // Ekran görüntüsü alındıktan sonra server'a gönder
    socket.emit('sendScreenData', { screenData: uri });

  } catch (error) {
    console.error("Ekran görüntüsü alınamadı: ", error);
  }
};

// Ekran görüntüsü isteğini dinleyecek event handler
useEffect(() => {
  socket.on('captureScreenRequest', captureAndSendScreen);
}, [socket]);

  // Satır bazında kullanıcı girişlerini ve girişlerin renklerini tutacak state
  const [userInput, setUserInput] = useState(Array(oyunModu).fill('').map(() => Array(oyunModu).fill({ value: '', color: 'white' })));

  const checkWinCondition = (updatedInput, rowIndex) => {
    // Kazanma koşulu: Tüm TextInput'larının rengi yeşil ise
    const isWin = updatedInput[rowIndex].every(input => input.color === 'green');
  
    if (isWin) {
      // Tüm harfler doğru, kazandınız!
      // Alert.alert("Tebrikler", "Oyunu kazandınız!");
      console.log("LOG-isWin")
      sendGameData();
      socket.emit('oyunBitti', { kazanan: socketId, odaIsmi: odaIsmi });

      // endGame("Tebrikler", "Oyunu kazandınız!");
    }
  };

  const endGame = (title, message) => {
    Alert.alert(title, message, [
      { text: "OK", onPress: () => navigation.navigate('Second', { user: user, harfSabiti: true }) }
    ]
  );
  console.log("alert tetiklendi")
  };

  useEffect(() => {
    const handleOyunBitti = ({ kazanan }) => {
      if (kazanan === socketId) {
        // Eğer bu client kazandıysa
        endGame("Tebrikler", "Oyunu kazandınız!");
      } else {
        // Eğer bu client kaybetti ise
        endGame("Üzgünüm", "Oyunu kaybettiniz!");
      }
    };
    

    // navigateToSecondPage event'ini dinle
    // const handleNavigateToSecondPage = () => {
    //   navigation.navigate('Second', { user: user, harfSabiti: true });
    // };
  
    socket.on('oyunBittiGosterme', handleOyunBitti);
    // socket.on('navigateToSecondPage', handleNavigateToSecondPage);

  // Clean up
  return () => {
    // socket.off('oyunBitti', handleOyunBitti);
    // socket.off('navigateToSecondPage', handleNavigateToSecondPage);
  };
}, [socket, navigation, user, harfSabiti]);
  
  
  const [guessCount, setGuessCount] = useState(0);
  // Harf girildiğinde çağrılacak fonksiyon
  const handleLetterChange = (text, rowIndex, colIndex) => {
    resetInactiveTimer(); // Kullanıcı her harf girdiğinde timer'ı sıfırla

    let updatedInput = userInput.map((row, rIndex) => 
      row.map((input, cIndex) => {
        if (rIndex === rowIndex && cIndex === colIndex) {
          return { ...input, value: text }; // Sadece mevcut TextInput'u güncelle
        }
        return input; // Diğerleri aynı kalır
      })
    );
  
    // Kontrol edilecek satırdaki son harf girildi mi
    const isLastLetterInRow = colIndex === oyunModu - 1;
  
    // Eğer son harf girildi ve tüm satırdaki harfler girilmişse renkleri kontrol et ve güncelle
    if (isLastLetterInRow && updatedInput[rowIndex].every(input => input.value !== '')) {
      updatedInput[rowIndex].forEach((input, index) => {
        const correctPosition = index;
        if (input.value === opponentWord[correctPosition]) {
          updatedInput[rowIndex][index].color = 'green'; // Doğru harf
        } else if (opponentWord.includes(input.value)) {
          updatedInput[rowIndex][index].color = 'orange'; // Harf var ama yanlış yerde
        } else {
          updatedInput[rowIndex][index].color = 'lightgray'; // Harf yok
        }
      });

      checkWinCondition(updatedInput, rowIndex); // Kazanma durumunu kontrol et

      if (isLastLetterInRow && updatedInput[rowIndex].every(input => input.value !== '')) {
        // Kazanma durumunu kontrol et.
        // checkWinCondition(updatedInput, rowIndex);
        // Yeni bir tahmin sayısı set et.
        setGuessCount(prevCount => prevCount + 1);
      }
    }
  
    setUserInput(updatedInput);
  };


  

  useEffect(() => {
    // Eğer tüm tahminler kullanıldıysa puan hesaplaması yap.
    if (guessCount === oyunModu) {
      const score = calculateScore(userInput, remainingTime);
      sendGameData();
      Alert.alert("Puanınız", `Toplam Puanınız: ${score}`);
    }
  }, [guessCount]); 


  const calculateScore = (inputMatrix, remainingTime) => {
    let greenCount = 0;
    let yellowCount = 0;
    inputMatrix[oyunModu-1].forEach(cell => {
        if (cell.color === 'green') {
          greenCount++;
        } else if (cell.color === 'orange') {
          yellowCount++;
        }
      });
  
    const score = (greenCount * 10) + (yellowCount * 5) + remainingTime;
    return score;
  };

  const handleAnnounceWinner = (data, socketId, setShowAlert) => {
    let message = 'Oyun berabere bitti.';
    if (data.winnerInfo.winner === socketId) {
      message = 'Tebrikler, oyunu kazandınız!';
    } else if (data.winnerInfo.loser === socketId) {
      message = 'Oyunu kaybettiniz.';
    }
    // Sadece bir kez alert göstermek için kontrol
    setShowAlert(true, message);
  };
  
  const [showAlert, setShowAlert] = useState({ show: false, message: '' });

  useEffect(() => {
    if (showAlert.show) {
      Alert.alert('Oyun Sonucu', showAlert.message, [
        { text: 'OK', onPress: () => navigation.navigate('Score' ,{user: user, }) }
      ]);
      // Alert gösterildikten sonra durumu sıfırlayın
      setShowAlert({ show: false, message: '' });
    }
  }, [showAlert, navigation]);
  
  useEffect(() => {
    // Aboneliği ayarlama ve temizleme
    const onAnnounceWinner = (data) => handleAnnounceWinner(data, socketId, (show, message) => setShowAlert({ show, message }));
    socket.on('announceWinner', onAnnounceWinner);
    return () => {
      socket.off('announceWinner', onAnnounceWinner);
    };
  }, [socket, socketId]); // socketId değişkeninin değişmeyeceğinden emin olun
  
  

  



  // TextInput'ları oluşturacak fonksiyon
  const renderInputMatrix = () => {
    return userInput.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.rowContainer}>
        {row.map((input, colIndex) => (
          <TextInput
            key={colIndex}
            style={[styles.letterInput, { backgroundColor: input.color }]}
            onChangeText={(text) => handleLetterChange(text, rowIndex, colIndex)}
            value={input.value}
            maxLength={1}
            // editable={input.editable} // TextInput'un düzenlenebilir olup olmadığını kontrol edin
          />
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.exitButton} onPress={handleExitGame}>
        <Text style={styles.exitButtonText}>Oyundan Çık</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.viewOpponentButton} onPress={viewOpponentScreen}>
        <Text style={styles.viewOpponentButtonText}>Rakibi Gör</Text>
      </TouchableOpacity>
      {/* <View>
        {opponentScreenUri && (
          <Image source={{ uri: opponentScreenUri }} style={{ width: 300, height: 300 }} />
        )}
      </View> */}
      {renderInputMatrix()}
      {warningTimer && (
        <Text style={styles.warningText}>
          {`Dikkat! Oyuna devam etmezseniz ${secondsLeft} saniye sonra yenilirsiniz.`}
        </Text>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  letterInput: {
    borderWidth: 2,
    width: 50,
    height: 50,
    margin: 3,
    textAlign: 'center',
    fontSize: 25,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },warningText: {
    position: 'absolute',
    top: 50,
    right: 25,
    padding: 10,
    backgroundColor: 'yellow',
    fontWeight: 'bold',
    zIndex: 1 // Diğer öğelerin üzerinde gözükmesini sağlar
  },exitButton: {
    position: 'absolute',
    top: 40, // StatusBar yüksekliğine göre ayarlayın
    left: 10,
    backgroundColor: 'red', // Arka plan rengi
    padding: 10,
    borderRadius: 5, // Kenar yuvarlaklığı
    zIndex: 1 // Diğer öğelerin üzerinde gözükmesini sağlar
  },
  exitButtonText: {
    color: 'white', // Metin rengi
    fontWeight: 'bold', // Metin kalınlığı
  },viewOpponentButton: {
    position: 'absolute',
    top: 40, // StatusBar yüksekliğine göre ayarlayın
    right: 10,
    backgroundColor: 'green', // Arka plan rengi
    padding: 10,
    borderRadius: 5, // Kenar yuvarlaklığı
    zIndex: 1 // Diğer öğelerin üzerinde gözükmesini sağlar
  },
  viewOpponentButtonText: {
    color: 'white', // Metin rengi
    fontWeight: 'bold', // Metin kalınlığı
  },

});

export default GamePage;
