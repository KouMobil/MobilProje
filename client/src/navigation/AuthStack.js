import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LoginPage , SingUpPage, GamePage, HomePage } from '../screens'
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const AuthStack = () => {

  return (


    <Stack.Navigator 
    initialRouteName='Login'
    screenOptions={{headerShown:false}}>
        <Stack.Screen name='Home' component={HomePage}/>
        <Stack.Screen name='Game' component={GamePage}/>
        <Stack.Screen name='Login' component={LoginPage}/>
        <Stack.Screen name='SingUp' component={SingUpPage} />
    </Stack.Navigator>
  )
}

export default AuthStack

const styles = StyleSheet.create({})