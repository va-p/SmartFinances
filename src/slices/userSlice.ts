import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface UserState {
  userId: string | null;
  userName: string | null;
  userLastName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  userRole: string | null;
  userProfileImage: string | null;
  userTenantId: number | null;
};

// Define the initial state using that type
const initialState: UserState = {
  userId: null,
  userName: null,
  userLastName: null,
  userEmail: null,
  userPhone: null,
  userRole: null,
  userProfileImage: null,
  userTenantId: null
};

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setUserId: (state, action: PayloadAction<UserState['userId']>) => {
      state.userId = action.payload;
    },
    setUserName: (state, action: PayloadAction<UserState['userName']>) => {
      state.userName = action.payload;
    },
    setUserLastName: (state, action: PayloadAction<UserState['userLastName']>) => {
      state.userLastName = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<UserState['userEmail']>) => {
      state.userEmail = action.payload;
    },
    setUserPhone: (state, action: PayloadAction<UserState['userPhone']>) => {
      state.userPhone = action.payload;
    },
    setUserRole: (state, action: PayloadAction<UserState['userRole']>) => {
      state.userRole = action.payload;
    },
    setUserProfileImage: (state, action: PayloadAction<UserState['userProfileImage']>) => {
      state.userProfileImage = action.payload;
    },
    setUserTenantId: (state, action: PayloadAction<UserState['userTenantId']>) => {
      state.userTenantId = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  setUserId,
  setUserName,
  setUserLastName,
  setUserEmail,
  setUserPhone,
  setUserRole,
  setUserProfileImage,
  setUserTenantId
} = userSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserId = (state: RootState) => state.user.userId;
export const selectUserName = (state: RootState) => state.user.userName;
export const selectUserLastName = (state: RootState) => state.user.userLastName;
export const selectUserEmail = (state: RootState) => state.user.userEmail;
export const selectUserPhone = (state: RootState) => state.user.userPhone;
export const selectUserRole = (state: RootState) => state.user.userRole;
export const selectUserImage = (state: RootState) => state.user.userProfileImage;
export const selectUserTenantId = (state: RootState) => state.user.userTenantId;

export default userSlice.reducer;