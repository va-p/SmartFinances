import { configureStore } from '@reduxjs/toolkit'

import cryptocurrencyQuotesBrlReducer from './slices/cryptocurrencyQuotesBrlSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    cryptocurrencyQuotesBrl: cryptocurrencyQuotesBrlReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store