import CartCharge from "@/components/pay/Cart/CartCharge";

type Params = { typePay: string };

type CartTypeProps = {
  params: Promise<Params>;
};
const CartTypePage = async ({ params }: CartTypeProps) => {
  // نوع پرداخت
  const { typePay } = await params;
  return <CartCharge />;
};

export default CartTypePage;
