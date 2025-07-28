import { createSlice } from '@reduxjs/toolkit';

const questionSlice = createSlice({
  name: 'question',
  initialState: {
    current: null,
  },
  reducers: {
    setCurrentQuestion(state, action) {
      state.current = action.payload;
    },
  },
});

export const { setCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;
