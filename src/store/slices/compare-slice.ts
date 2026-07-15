import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
  items: string[];
  maxItems: number;
}

const initialState: CompareState = {
  items: [],
  maxItems: 4,
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<string>) => {
      if (
        !state.items.includes(action.payload) &&
        state.items.length < state.maxItems
      ) {
        state.items.push(action.payload);
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((id) => id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;
