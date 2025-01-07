import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HomePage, ProfilePage, GamePage, LobiPage, SecondPage , TakeWordPage, OpponentPage , ScorePage} from '../screens'
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const UserStack = () => {

  return (
    <Stack.Navigator 
    initialRouteName='Home'
    screenOptions={{headerShown:false}}>
        <Stack.Screen name='Home' component={HomePage}/>
        <Stack.Screen name='Second' component={SecondPage} />
        <Stack.Screen name='Lobi' component={LobiPage} />
        <Stack.Screen name='Game' component={GamePage}/>
        <Stack.Screen name='Profile' component={ProfilePage} />
        <Stack.Screen name='TakeWord' component={TakeWordPage} />
        <Stack.Screen name='Opponent' component={OpponentPage} />
        <Stack.Screen name='Score' component={ScorePage} />
    </Stack.Navigator>
  )
}

export default UserStack
