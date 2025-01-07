import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import UserStack from './UserStack';
import app from '../../firebassConfig';

const RootNavigation = () => {
  // useSelector hook'unu kullanarak Redux state'inden isAuth durumunu al
  const isAuth = useSelector((state) => state.user.isAuth);
// console.log(socketData)
  return (
    <NavigationContainer>
      {
        isAuth ? <UserStack /> : <AuthStack />
      }    
    </NavigationContainer>
  );
}

export default RootNavigation;
