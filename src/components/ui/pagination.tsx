import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisible = 5;
  let visiblePages = pages;
  if (totalPages > maxVisible) {
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    visiblePages = pages.slice(start - 1, end);
  }
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {visiblePages.map((p) => (
        <Button
          key={p}
          variant={currentPage === p ? "default" : "outline"}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
