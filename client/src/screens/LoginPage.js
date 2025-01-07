import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import React, {useState , useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux'
import {  setLogin } from '../redux/userSlice';
import { login } from '../redux/userSlice'
import io from 'socket.io-client';




const LoginPage = ({navigation}) => {

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
//   const [result, setResult] = useState();

// const { email, password } = useSelector ((state)=> state.user);
const dispatch = useDispatch();

    // console.log("Email: " , email)
    // console.log("Password: " , password)

  return (
    <View style={styles.container}>

      <Image 
      source={require('../../assets/images/loginImage.jpg')}
      style = {styles.image} />

      <Text style = {styles.welcome}>Welcome</Text>

      <Text>User Name</Text>
      <TextInput 
        // keyboardType='numeric'
        placeholder='Enter your user name'
        style = { styles.TextInoutStyle}
        onChangeText={setEmail}
        value = {email}
      />

      <Text>Password</Text>
      <TextInput 
        placeholder='Enter your password'
        style = { styles.TextInoutStyle}
        onChangeText={setPassword}
        value = {password}
        secureTextEntry = {true}
      />

        {/* console.log("Email 2: " , email) */}
      <Pressable
        onPress={()=> dispatch( login({email, password}) )} 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue"
        },styles.button]} >
        <Text style = {styles.buttonText}>Login</Text>        
      </Pressable>
      
      <Pressable
        onPress={()=> 
            navigation.navigate('SingUp')
        } 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "lightgray",
          marginTop:20
        },styles.SingUpButton]} >
        <Text style = {styles.buttonText}>Sing Up</Text>        
      </Pressable>

    </View>
  );
}

export default LoginPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },TextInoutStyle:{
    borderWidth:1,
    width: '80%',
    height: 40,
    borderRadius: 15,
    marginVertical: 10,
    textAlign: "center",
    color: 'blue',
    fontWeight: 'bold',
    // fontSize: 20
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
  },image:{
    width: 200,
    height: 200,
  },welcome:{
    fontSize:20,
    fontWeight: 'bold',
    marginVertical:10
  },SingUpButton:{
    width: '40%',
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: "center",
  }
});
