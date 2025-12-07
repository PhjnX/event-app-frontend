import { configureStore } from "@reduxjs/toolkit";
import listUserReducer from "./slices/list-user";
import authReducer from "./slices/auth"; // Import reducer mới tạo

const env = import.meta.env.NODE_ENV;

const store = configureStore({
  reducer: {
    listUser: listUserReducer,
    auth: authReducer, // Thêm vào đây
  },
  devTools: env !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
