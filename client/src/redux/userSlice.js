import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    role: null,
    name: '',
  },
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
    },
    setName(state, action) {
      state.name = action.payload;
    },
  },
});

export const { setRole, setName } = userSlice.actions;
export default userSlice.reducer;
