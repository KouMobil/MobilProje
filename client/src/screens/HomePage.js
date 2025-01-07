import React from 'react';
import { View,Pressable, Button,Text, StyleSheet } from 'react-native';
import { useSelector, useContext } from 'react-redux';
// import SocketContext from '../../SocketContext';


const HomePage  = ({ navigation }) => {

  // const socket = useContext(SocketContext);

  const user = useSelector((state) => state.user.user);
  // console.log(user.email)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={()=> navigation.navigate('Second', {user: user, harfSabiti: true})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>Harf Sabitli Oyun</Text>        
      </Pressable>

      <View style={styles.spacer} />

      <Pressable
        onPress={()=> navigation.navigate('Second', {user: user, harfSabiti: false})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>Serbest Oyun</Text>        
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  spacer: {
    height: 20, // Butonlar arasında boşluk oluşturmak için
  },button:{
    // borderWidth: 1,
    width: '80%',
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: "center",
    // backgroundColor: "lightblue"
  },buttonText:{
    fontWeight: 'bold',
    color: 'white'
  }
});

export default HomePage;





