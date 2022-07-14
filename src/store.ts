import { configureStore } from '@reduxjs/toolkit'

import amountBrlReducer from './slices/amountBrlSlice';
import amountBtcReducer from './slices/amountBtcSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    amountBrl: amountBrlReducer,
    amountBtc: amountBtcReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store