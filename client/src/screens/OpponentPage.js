// OpponentScreen.js
import React from 'react';
import { View, Text , StyleSheet, Image} from 'react-native';

const OpponentPage = ({ route }) => {
  // Rakibin ekran verilerini `route.params` üzerinden alın
  const { screenData } = route.params;

  return (
      <View style={styles.container}>
        <Text style = {styles.text}>
          Rakip Ekranı
        </Text>
        <Image source={{ uri: screenData }} style={{ width: '100%' , height: '60%' }} />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },text:{
    fontWeight: 'bold',
    color: 'black',
    fontSize:20,
  },
});

export default OpponentPage;
