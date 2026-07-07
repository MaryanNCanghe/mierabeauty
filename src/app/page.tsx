// "use client";

import CategoryList from "@/components/CategoryList";
import ProductList from "@/components/ProductList";
import Skeleton from "@/components/Skeleton";
import Slider from "@/components/Slider";
import { Suspense } from "react";

const HomePage = async () => {

  return (
    <div className="">
      <Slider />
      <div className="mt-24">
        <Suspense fallback={<Skeleton />}>
          <CategoryList 
          />   
        </Suspense>

         <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
        <h2 className="m-section-title m-section-title--underline mb-8">New Arrivals</h2>
        <Suspense fallback={<Skeleton />}>
          <ProductList
            limit={6}
            showPagination={false}
            gridCols={4}
          />
        </Suspense>
      </div>
      </div>
    </div>
  );
};

export default HomePage;