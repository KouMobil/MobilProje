import React, { useState } from 'react';
import { View, Button, TextInput, StyleSheet, Text, Image } from 'react-native';
import { auth, db } from '../../firebassConfig'; // Önceden oluşturduğunuz firebaseConfig dosyasını import edin
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const SignUpPage = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
        const auth = getAuth()
      // Kullanıcıyı Firebase Authentication'a kaydet
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User account created & signed in!');

      // Kullanıcı bilgilerini Firestore'a kaydet
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        creationDate: Timestamp.fromDate(new Date())
      });

      alert('Registration successful!');
      navigation.navigate('Login')
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>

    <Image 
      source={require('../../assets/images/singUp.png')}
      style = {styles.image} />


      <Text style={styles.text}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Şifre gizlenerek gösterilir
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  text: {
    marginBottom: 20,
    fontSize: 20
  },
  input: {
    width: '90%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5
  },image:{
    width: 200,
    height: 200,
  }
});

export default SignUpPage;
