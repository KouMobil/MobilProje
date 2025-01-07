import React from 'react';
import RootNavigation from './src/navigation/RootNavigation';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import io from 'socket.io-client';
import SocketContext from './SocketContext';



// App.js veya başka bir dosya içinde
const socket = io('http://172.20.10.4:8080');


const App = () =>{
  return(
    // <Provider store={store}>
    //   <RootNavigation/>
    // </Provider>
    <Provider store={store}>
      <SocketContext.Provider value={socket}>
        <RootNavigation/>
      </SocketContext.Provider>
    </Provider>
  )
}


export default App
