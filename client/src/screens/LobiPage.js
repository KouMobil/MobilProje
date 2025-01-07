import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import SocketContext from '../../SocketContext';

const LobiPage = ({ route, navigation }) => {
  const { user, harfSabiti, oyunModu } = route.params;
  const socket = useContext(SocketContext);
  const [lobiKullanicilari, setLobiKullanicilari] = useState([]);
  const keyExtractor = (item, index) => index.toString();
  const [playerStatuses, setPlayerStatuses] = useState({});

  
  const sendGameRequest = (opponentId) => {
  
    // Öncelikle 'user' nesnesinin içeriğini kontrol edin.
  console.log('User object:', user);
  console.log('Socket ID:', socket.id);
  console.log("Opponent_Id: " , opponentId)
    
    // 'user.id' ve 'user.username' tanımlı olduğundan emin olun.
    if (user && user.uid && user.email) {
      socket.emit('oyunIstegiGonder', { fromId: socket.id, fromUsername: user.email, to: opponentId });
      console.log(`Game request sent to ${opponentId} from ${socket.id}`);
    } else {
      console.log('User id or username is not defined');
    }

    
    
  };

  // Kullanıcı bilgileri ve oda seçimi için event listenerları ayarlayın
  const odaIsmi = '';

  useEffect(() => {
    this.odaIsmi = `${oyunModu}_${harfSabiti}`;

    // Oda seçimi yapılıyor
    socket.emit('odaSec', { harfSabiti, oyunModu, email:user.email });

    // Lobi kullanıcılarını almak için dinleyici
    // socket.on('lobiKullanicilari', (kullanicilar) => {
    //   setLobiKullanicilari(kullanicilar.map(kullaniciId => ({ id: kullaniciId })));
    // });
    // console.log("girdi")

    socket.on('lobiKullanicilari', (kullanicilar) => {
      // console.log('Gelen kullanıcılar:', kullanicilar);
      // Sunucu her kullanıcının bilgisini { id: 'soket_id', email: 'kullanıcı_email' } şeklinde göndermeli
      setLobiKullanicilari(kullanicilar);
      // console.log("lobiKullanicilari")
    });
    

    // Temizlik fonksiyonu
    return () => {
      socket.emit('odadanAyril', this.odaIsmi); // Kullanıcı odadan ayrılıyor
      socket.off('lobiKullanicilari');
    };
  }, [socket, harfSabiti, oyunModu]);


  useEffect(() => {
    // Oyun isteği aldığımızda çalışacak event
    socket.on('oyunIstegi', (data) => {
      const { from, fromId } = data;

      let requestTimeout = null;
      // Kullanıcıya bir Alert ile oyun isteği soruluyor
      Alert.alert(
        'Oyun İsteği',
        // `${from} kullanıcısından oyun isteği aldınız. Kabul ediyor musunuz?`,
        `${data.fromUsername} kullanıcısından oyun isteği aldınız. Kabul ediyor musunuz?`,
        [
          {
            text: 'Reddet',
            onPress: () => {
              console.log('Oyun isteği reddedildi');
              socket.emit('oyunIstegiCevap', { from: socket.id, to: fromId, cevap: 'red' });
              if (requestTimeout) {
                clearTimeout(requestTimeout);
              }
            },
            style: 'cancel',
          },
          { 
            text: 'Kabul Et', 
            onPress: () => {
              console.log('Oyun isteği kabul edildi');
              socket.emit('oyunIstegiCevap', { from: socket.id, to: data.fromId, cevap: 'kabul' });
              if (requestTimeout) {
                clearTimeout(requestTimeout);
              }
              console.log("Oyun isteği kabul: " , socket.id)
              navigation.navigate('TakeWord',{ user: user, harfSabiti: harfSabiti, oyunModu: oyunModu, odaIsmi: this.odaIsmi, socketId: socket.id}); // GamePage ekranına yönlendir
              // Burada oyun sayfasına yönlendirme yapabilirsiniz veya oyunu başlatabilirsiniz
            },
          },
        ],
        { cancelable: false }
      );

      requestTimeout = setTimeout(() => {
        console.log('Oyun isteği zaman aşımına uğradı');
        socket.emit('oyunIstegiCevap', { from: socket.id, to: fromId, cevap: 'red' });
        Alert.alert('Zaman Aşımı', 'Oyun isteği zaman aşımına uğradı.');
      }, 10000); // 10 saniye



    });
  
    return () => {
      socket.off('oyunIstegi');
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
    };
  }, [socket, user.id, navigation]);
  

  useEffect(() => {
    socket.on('oyunBasladi', () => {
      socket.emit('updateStatus', { userId: user.uid, status: 'in game' });
      navigation.navigate('TakeWord', { user: user, harfSabiti: harfSabiti, oyunModu: oyunModu, odaIsmi: this.odaIsmi,socketId: socket.id}); // GamePage ekranına yönlendir
    });
  
    return () => {
      socket.off('oyunBasladi');
    };
  }, [socket, navigation]);

  useEffect(() => {
    console.log("burda")
    socket.on('statusUpdate', (updatedStatuses) => {
      // Update local state with the new statuses
      // This will trigger a re-render and update the UI
      setPlayerStatuses(prevStatuses => ({
        ...prevStatuses,
        ...updatedStatuses
      }));
      console.log("updateStatus: ",updatedStatuses)
    });
  
    return () => {
      socket.off('statusUpdate');
    };
  }, [socket]);
  

  useEffect(() => {
    socket.on('redAlert', () => {
      Alert.alert("Rededildi", "Oyun talebi red edildi!!")
    });
  
    return () => {
      // socket.off('redAlert');
    };
  }, [socket, navigation]);


  
  const renderItem = ({ item }) => {
  
    // console.log("Render item: ", item); // Her bir item'ı konsolda görmek için log atın
  console.log('Current player statuses:', playerStatuses);
  // Burada `item.email` kullanıcıya ait e-posta adresini temsil ediyor
  
  return (
    <Pressable style={styles.button} onPress={() => sendGameRequest(item.id)}>
      {/* <Text style={styles.buttonText}>{`Kullanıcı: ${item.email}`}</Text> */}
      <Text style={styles.buttonText}>
        {`Kullanıcı: ${item.email || 'E-posta bilgisi yok'}`}
        {' - '}
        {playerStatuses[item.id] || 'Aktif'}
      </Text>
    </Pressable>
  );
};

  

  // console.log(lobiKullanicilari)
  return (
    <View style={styles.container}>
      <FlatList
        data={lobiKullanicilari}
        // keyExtractor={(item) => item.id}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Bu satırı kaldırın
    alignItems: 'center', // Bu satırı kaldırın
  },
  flatListContent: {
    flexGrow: 1, // FlatList'i genişlet
    justifyContent: 'center', // İçeriği dikey olarak merkeze al
    alignItems: 'center', // İçeriği yatay olarak merkeze al
  },
  button: {
    backgroundColor: 'skyblue',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    minHeight: 50, // Tıklama alanını genişlet
    justifyContent: 'center' // İçeriği merkeze al
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },

});

export default LobiPage;
