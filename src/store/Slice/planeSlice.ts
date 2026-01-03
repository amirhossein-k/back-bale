// src\store\orderSlice.ts
import { Plan } from "@/types/pay";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// پلن انتخاب شده و شماره موبایل خریدار
export type CartItem = {

    plan: Plan; //اطلاعات محصول
};


interface CartState {
    items: CartItem[]
    totalPrice: number;
    OpenCart: boolean
    accessCart: boolean
    phoneNumber: string;
}

const initialState: CartState = {
    // orderplane: [],
    items: [],
    totalPrice: 0,
    OpenCart: false,
    accessCart: false,
    phoneNumber: ''
}

const planSlice = createSlice({
    name: "cartPlan", // ✅ نام اسلایس را به cart تغییر می‌دهیم
    initialState,
    reducers: {
        // این اکشن برای همگام‌سازی اولیه سبد خرید از دیتابیس با Redux است
        setCartPlanFromDB: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            state.totalPrice = action.payload[0].plan.price;
        },

        // افزودن محصول به سبد یا افزایش تعداد آن
        addItemPlan: (state, action: PayloadAction<{ plan: Plan }>) => {
            const { plan } = action.payload;
            const existingItem = state.items.find(item => item.plan.id === plan.id);



            if (existingItem) {
                return
            } else {


                state.items[0].plan = plan;
            }
            state.totalPrice = state.items[0].plan.price;
        },



        // حذف کامل یک آیتم از سبد
        removeItemPlan: (state, action: PayloadAction<{ plan: Plan }>) => {
            state.items = state.items.filter(item => item.plan.id !== action.payload.plan.id);
            state.totalPrice = 0;
        },

        // باز و بسته کردن سبد خرید
        setCartPlanOpen: (state, action: PayloadAction<boolean>) => {
            state.OpenCart = action.payload;
        },
        // اگر در سبد خرید تایید نهایی شد  true  شود
        // تا صفحه cart براش نمایش داده شود 
        setAccessCartPlan: (state, action: PayloadAction<boolean>) => {
            state.accessCart = action.payload;
        },

        // پاک کردن کامل سبد خرید
        clearCartPlan: (state) => {
            state.items = [];
            state.totalPrice = 0;
        },
        // 🟢 سفارش انتخاب شده


    },
});


export const {
    setCartPlanFromDB,
    addItemPlan,
    removeItemPlan,
    setCartPlanOpen,
    setAccessCartPlan,
    clearCartPlan,
} = planSlice.actions
export default planSlice.reducer