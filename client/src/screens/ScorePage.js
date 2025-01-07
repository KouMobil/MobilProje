import React , {useEffect,useContext} from 'react';
import { StyleSheet, Text, View, Image ,TouchableOpacity , Alert} from 'react-native';
import SocketContext from '../../SocketContext';


const ScorePage = ({ route, navigation }) => {
  const socket = useContext(SocketContext);

  const { userScore, opponentScore, userScreen, opponentScreen, socketId, odaIsmi, harfSabiti,oyunModu, user } = route.params;

  const DuelloIstegiGonder = () => {

    socket.emit('oyunIstegiGonderScorePage', { fromId: socket.id , odaIsmi: odaIsmi});
    // console.log(`Duell sent to ${opponentId} from ${socket.id}`);
  };


  useEffect(() => {
    socket.on('oyunIstegiScorePage', (data) => {
      Alert.alert(
        'Duello İsteği',
        `Duello isteği aldınız. Kabul ediyor musunuz?`,
        [
          {
            text: 'Reddet',
            onPress: () => {
              console.log('Duello isteği reddedildi');
              socket.emit('oyunIstegiCevapScorePage', { from: socket.id, to: fromId, cevap: 'red' });
            },
            style: 'cancel',
          },
          { 
            text: 'Kabul Et', 
            onPress: () => {
              console.log('Duello isteği kabul edildi');
              socket.emit('oyunIstegiCevapScorePage', { from: socket.id, to: data.fromId, cevap: 'kabul' ,room: odaIsmi});
              console.log("Duello isteği kabul: " , socket.id)
              // navigation.navigate('TakeWord',{ user: user, harfSabiti: harfSabiti, oyunModu: oyunModu, odaIsmi: this.odaIsmi, socketId: socket.id}); // GamePage ekranına yönlendir
            },
          },
        ],
        { cancelable: false }
      );

    });
  
    return () => {
      socket.off('oyunIstegi');
    };
  }, [ navigation]);

  useEffect(() => {
    socket.on('oyunBasladiScorePage', () => {
      // navigation.navigate('TakeWord', { user: user, harfSabiti: harfSabiti, oyunModu: oyunModu, odaIsmi: odaIsmi,socketId: socketId}); // GamePage ekranına yönlendir
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TakeWord',
            params: { user: user, harfSabiti: harfSabiti, oyunModu: oyunModu, odaIsmi: odaIsmi,socketId: socketId}
          }
        ],
      });
    
  
    });
  
    return () => {
      socket.off('oyunBasladiScorePage');
    };
  }, [navigation]);


  const handleExitGameConfirmed = () => {
    navigation.navigate('Second', {user: user, harfSabiti: true});
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.viewOpponentButton} onPress={DuelloIstegiGonder}>
        <Text style={styles.viewOpponentButtonText}>Duello</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.exitButton} onPress={handleExitGameConfirmed}>
        <Text style={styles.exitButtonText}>Oyundan Çık</Text>
      </TouchableOpacity>

      <View style={styles.scoreSection}>
        <Text style = {{marginBottom: 30, color: 'blue', fontSize: 15, fontWeight: 'bold'}}>User Score {userScore}</Text>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: userScreen }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.scoreSection}>
        <Text style = {{marginBottom: 30, color: 'blue', fontSize: 15, fontWeight: 'bold'}}>Opponent Score {opponentScore}</Text>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: opponentScreen }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scoreSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 50,
  },
  imageContainer: {
    width: '100%', // Container genişliği
    height: '80%', // Container yüksekliğini ebeveynin %80'i yap
    overflow: 'hidden', // Kesme işlemi için gerekli
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ translateY: -(500 * 0.1) }], // Resmi %10 yukarı çekerek üstten %10'unu keser
  },
  viewOpponentButton: {
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
  }
});

export default ScorePage;
