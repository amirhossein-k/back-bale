// "use server";

// import BaleMiniApp from "@/components/BaleMiniApp";
// import TestCharge from "@/components/BaleUI/ChargeManager/Test";
// import TestCharge2 from "@/components/BaleUI/ChargeManager/Test2";
// import TestCharge3 from "@/components/BaleUI/ChargeManager/Test3";

// type Params = { buildingId: any; userId: any };

// type Props = {
//   params: Promise<Params>;
//   searchParams: Promise<URLSearch>;
// };
// type URLSearch = {
//   page: string;
// };
// async function dashboardPage({ params, searchParams }: Props) {
//   const { buildingId, userId } = await params;
//   const { page } = await searchParams;
//   console.log(page, "page");
//   const BOT_TOKEN = process.env.BOT_TOKEN!;

//   return (
//     <BaleMiniApp/>

//   );
// }

// export default dashboardPage;
"use client";

import BaleMiniApp from "@/components/BaleMiniApp";

const dashboardPage = () => {
  return (
    <div>
      <BaleMiniApp />
    </div>
  );
};

export default dashboardPage;
