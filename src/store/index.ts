import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/store/slices/cart-slice";
import compareReducer from "@/store/slices/compare-slice";
import wishlistReducer from "@/store/slices/wishlist-slice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    compare: compareReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
