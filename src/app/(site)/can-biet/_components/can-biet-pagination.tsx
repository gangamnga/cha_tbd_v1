import { SitePagination } from "@/app/_components/site-pagination";

export function CanBietPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <SitePagination
      currentPage={currentPage}
      totalPages={totalPages}
      baseUrl="/can-biet?"
    />
  );
}
