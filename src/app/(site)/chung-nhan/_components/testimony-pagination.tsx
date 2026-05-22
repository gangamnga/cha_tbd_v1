import { SitePagination } from "@/app/_components/site-pagination";

export function TestimonyPagination({
  currentPage,
  totalPages,
  category,
}: {
  currentPage: number;
  totalPages: number;
  category: string;
}) {
  return (
    <SitePagination
      currentPage={currentPage}
      totalPages={totalPages}
      baseUrl={`/chung-nhan?cat=${category}`}
    />
  );
}
