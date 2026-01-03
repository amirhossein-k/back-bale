// 'use server'
// import { revalidatePath } from "next/cache";
// import { getServerSession } from "next-auth"; // اگر auth داری
// import { authOptions } from "@/lib/auth";
// import { CartItem } from "@/store/Slice/planeSlice";


// // **
// //  * تابع برای افزودن یک محصول به سبد خرید یا به‌روزرسانی تعداد آن
// //  */
// export async function createOrder(data: CartItem) {
//        try {
//               console.log('createOrder!!!!!!!!!!!!')
//               // 👇 چک هویت کاربر
//               const session = await getServerSession(authOptions);
//               console.log(session, 'sesssion')
//               if (!session?.user?.id || session === null) {
//                      console.log('object')
//                      return { success: false, error: true, message: "لطفا برای خرید وارد حساب کاربری شود!" };
//               }

//               const userId = session.user.id;

//               // ۱. اطلاعات محصول را برای قیمت‌گذاری پیدا می‌کنیم

//               const product = await prisma.product.findUnique({
//                      where: { id: data.productId },
//                      select: { supplierId: true, priceWithProfit: true, priceOffer: true, colors: true, price: true },
//               });

//               if (!product) {
//                      throw new Error("محصول مورد نظر یافت نشد.");
//               }
//               // ✅ محاسبه قیمت واحد با تخفیف
//               const basePrice = product.priceWithProfit
//               if (basePrice == null) throw new Error("قیمت محصول مشخص نشده است.");
//               // قیمت نهایی
//               const unitPrice =
//                      product.priceOffer && product.priceOffer > 0
//                             ? basePrice - (basePrice * product.priceOffer) / 100
//                             : basePrice;

//               // فیلتر رنگ انتخاب‌شده از بین رنگ‌های همین محصول
//               const selectedColor = product.colors.find(c => c.id === data.colorsSelect);
//               if (!selectedColor) {
//                      return { success: false, error: true, message: "رنگ انتخاب‌شده برای این محصول وجود ندارد" };
//               }
//               if (selectedColor.inventory < data.quantity) {
//                      return {
//                             success: false,
//                             error: true,
//                             message: `حداکثر ${selectedColor.inventory} عدد از رنگ "${selectedColor.color}" موجود است.`,
//                      };
//               }

//               // ۲. سبد خرید فعلی کاربر را پیدا می‌کنیم
//               let cart = await prisma.purchaseOrder.findFirst({
//                      where: {
//                             storeOwnerId: userId,
//                             status: "LOADING",
//                      },
//                      include: {
//                             items: true,
//                      },
//               });
//               // ۳. اگر سبد خریدی وجود نداشت، یکی جدید ایجاد می‌کنیم
//               if (!cart) {
//                      cart = await prisma.purchaseOrder.create({
//                             data: {
//                                    storeOwnerId: userId,
//                                    status: "LOADING",
//                                    totalPrice: 0, // قیمت کل در ابتدا صفر است
//                             },
//                             include: {
//                                    items: true
//                             },
//                      });
//               }


//               // ۴. چک می‌کنیم آیا این محصول با همین مشخصات (colorsSelect) قبلاً در سبد بوده یا نه
//               const existingItem = cart.items.find(
//                      (item) => item.productId === data.productId && item.colorsSelect === data.colorsSelect
//               );

//               if (existingItem) {
//                      // 👇 رفع باگ: بررسی موجودی برای تعداد کل جدید
//                      const newTotalQuantity = existingItem.quantity + data.quantity;
//                      if (selectedColor.inventory < newTotalQuantity) {
//                             return { success: false, error: true, message: `موجودی کافی نیست. حداکثر ${selectedColor.inventory} عدد از این محصول می‌توانید سفارش دهید.` };
//                      }
//                      // اگر بود، تعدادش را آپدیت می‌کنیم
//                      await prisma.purchaseOrderItem.update({
//                             where: { id: existingItem.id },
//                             data: {
//                                    quantity: {
//                                           increment: data.quantity, // تعداد جدید را اضافه می‌کنیم
//                                    },
//                                    totalPrice: {
//                                           increment: data.quantity * unitPrice,
//                                    },
//                             },
//                      });
//               } else {
//                      // اگر آیتم جدید است، فقط موجودی را برای تعداد درخواستی چک کن
//                      if (selectedColor.inventory < data.quantity) {
//                             return { success: false, error: true, message: `حداکثر ${selectedColor.inventory} عدد از این محصول موجود است.` };
//                      }
//                      // اگر نبود، یک آیتم سفارش جدید ایجاد می‌کنیم و به سبد خرید متصل می‌کنیم
//                      await prisma.purchaseOrderItem.create({
//                             data: {
//                                    orderId: cart.id,
//                                    productId: data.productId,
//                                    quantity: data.quantity,
//                                    colorsSelect: data.colorsSelect,
//                                    unitPrice: unitPrice,
//                                    totalPrice: data.quantity * unitPrice,
//                             },
//                      });
//               }
//               // ۵. قیمت کل سبد خرید را مجدداً محاسبه و آپدیت می‌کنیم
//               const updatedCartItems = await prisma.purchaseOrderItem.findMany({
//                      where: { orderId: cart.id },
//                      select: { totalPrice: true },
//               });

//               const newTotalPrice = updatedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

//               await prisma.purchaseOrder.update({
//                      where: { id: cart.id },
//                      data: {
//                             totalPrice: newTotalPrice,
//                      },
//               });

//               revalidatePath("/cart"); // مسیر صفحه سبد خرید را revalidate می‌کنیم



//               // بعد از آپدیت یا ایجاد آیتم
//               const newItem = await prisma.purchaseOrderItem.findFirst({
//                      where: {
//                             orderId: cart.id,
//                             productId: data.productId,
//                             colorsSelect: data.colorsSelect,
//                      },
//                      include: {
//                             product: {
//                                    select: {
//                                           id: true,
//                                           title: true,
//                                           priceWithProfit: true,
//                                           productImage: true,
//                                           priceOffer: true,
//                                           price: true
//                                    },
//                             },
//                      },
//               });

//               return { success: true, data: newItem, message: "اضافه شد", error: false };
//        } catch (error) {
//               console.error(error);
//               return { success: false, message: "خطا در اضافه کردن به لیست خرید", error: true };
//        }
// }
