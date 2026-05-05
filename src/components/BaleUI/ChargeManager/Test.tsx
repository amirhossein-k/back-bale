"use client";

import Link from "next/link";

const TestCharge = () => {
  return (
    <div>
      <Link href={"/dashboard?page=test2"}>test2</Link>
    </div>
  );
};

export default TestCharge;
