import React from 'react'
import { View,Pressable,Text, StyleSheet } from 'react-native';

const SecondPage = ({ route , navigation }) => {

  const { user, harfSabiti } = route.params;

  // console.log(user, harfSabiti)

  return (
    
    <View style= {styles.container}>
      <Pressable
        onPress={()=> navigation.navigate('Lobi', {user: user, harfSabiti: harfSabiti, oyunModu: 4})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>4 Harfli Oyun</Text>        
      </Pressable>

      <View style={styles.spacer} />

      <Pressable
        onPress={()=> navigation.navigate('Lobi', {user: user, harfSabiti: harfSabiti, oyunModu: 5})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>5 Harfli Oyun</Text>        
      </Pressable>

      <View style={styles.spacer} />

      <Pressable
        onPress={()=> navigation.navigate('Lobi', {user: user, harfSabiti: harfSabiti, oyunModu: 6})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>6 Harfli Oyun</Text>        
      </Pressable>

      <View style={styles.spacer} />

      <Pressable
        onPress={()=> navigation.navigate('Lobi', {user: user, harfSabiti: harfSabiti, oyunModu: 7})} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>7 Harfli Oyun</Text>        
      </Pressable>
    </View>
  )
}

export default SecondPage

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