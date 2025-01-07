import { Pressable, StyleSheet, Text, View } from 'react-native'
import React , {useState} from 'react'
import { collection, addDoc ,getDocs} from "firebase/firestore";
import { db } from '../../firebassConfig';

const HomePage = () => {
  
  const [data, setData] = useState([])

  console.log("Data: " , data)

const sendData = async() => {
  try {
    const docRef = await addDoc(collection(db, "Yazlab"), {
      title: "Iboo",
      content: "React Native tutorial for beginner",
      lesson: 100
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


const getData = async() => {
  const allData = [];
  const querySnapshot = await getDocs(collection(db, "Yazlab"));
  querySnapshot.forEach((doc) => {
    // console.log(`${doc.id} => ${doc.data()}`);
    // setData([ ...data, doc.data() ])
    allData.push(doc.data());
  });
  setData(allData);

}


  return (
    <View style = {styles.container}>
      
    
           {/* <Text>{data[0].title}</Text>
           <Text>{data[0].content}</Text>
           <Text>{data[0].lesson}</Text>
           <Text>{data[1].title}</Text>
           <Text>{data[1].content}</Text>
           <Text>{data[1].lesson}</Text> */}

      
      {data && data.map((item, index) => (
      <View key={index} style={styles.itemContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.lesson}>{item.lesson}</Text>
      </View>
    ))}

      

      <Pressable
      onPress={()  => sendData() } 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue",
          marginTop:20
        },styles.button]} >
        <Text style = {styles.buttonText}>SEND</Text>   
      </Pressable>


      <Pressable
      onPress={()  => getData() } 
        style = { ({pressed}) => [{
          backgroundColor: pressed ? "gray" : "blue",
          marginTop:20
        },styles.button]} >
        <Text style = {styles.buttonText}>GET</Text>   
      </Pressable>


    </View>
  )
}

export default HomePage

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'tomato'
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

})