import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'


export const login = createAsyncThunk( 'user/login', async ({email, password},thunkAPI) =>{
    try {
        // console.log(email, password)
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth,email, password)

        const user = userCredential.user
        const token = user.stsTokenManager.accessToken
        
        const socket = thunkAPI.getState().SocketContext;

        const userData= {
            token,
            // user: user,
            user: {
                uid: user.uid,
                email: user.email,
                password: user.password,
                // Diğer serileştirilebilir kullanıcı özelliklerini buraya ekleyin
            },
        } 

        return userData;

    } catch (error) {
        console.log("userslice error: " , error)
        throw error
    }

})




const initialState = {
    // email: null,
    // password: null,
    isAuth: false,
    error: null,
    // users:{
    //     userEmail: "test@test.com",
    //     userPassword: "123456",
    // }
  } 


  export const userSlice = createSlice ({
    name : "user",
    initialState,
    reducers:{
         setEmail: (state, action) => {
            state.email = action.payload 
         },
         setPassword: (state, action) => {
            state.password = action.payload
         },setLogin: (state) => {
            if((state.email === state.user.userEmail) 
                && (state.password === state.user.userPassword )){
                    console.log(isAuth)
                }
         }
    },extraReducers:(builder) => {
        builder
        .addCase(login.pending, (state) => {
            state.isAuth = false
            // console.log("pending")
        })
        .addCase(login.fulfilled, (state, action) => {
            state.isAuth = true;
            state.user = action.payload.user
            state.token = action.payload.token
            // console.log("fulfield")
        })
        .addCase(login.rejected, (state ,action) => {
            state.isAuth = false
            state.error = action.error.message 
            // console.log("rejected")
        })
    }  
  })

export const {setEmail , setPassword, setLogin,} = userSlice.actions
export default userSlice.reducer
