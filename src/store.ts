import { configureStore } from '@reduxjs/toolkit';

import accountReducer from './slices/accountSlice';
import quotesReducer from './slices/quotesSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    account: accountReducer,
    quotes: quotesReducer,
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
