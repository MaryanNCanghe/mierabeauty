"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({
  currentPage,
  hasPrev,
  hasNext,
}: {
  currentPage: number;
  hasPrev: boolean;
  hasNext: boolean;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const createPageUrl = (pageNumber: number) => {
const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("page", pageNumber.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-12 flex justify-between w-full">
      <button
        className="z-btn--primary p-3 w-24 cursor-pointer disabled:cursor-not-allowed disabled:bg-grey-200"
        disabled={!hasPrev}
        onClick={() => createPageUrl(currentPage - 1)}
      >
        Previous
      </button>
      <button
        className="z-btn--primary p-3 w-24 cursor-pointer disabled:cursor-not-allowed disabled:bg-grey-200"
        disabled={!hasNext}
        onClick={() => createPageUrl(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
