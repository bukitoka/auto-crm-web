import { Search } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { globalSearch } from "@/features/search/api";
import { SearchResults } from "@/features/search/components/search-results";
import { getParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = getParam(await searchParams, "q")?.trim();

  if (!query) {
    return (
      <EmptyState
        icon={Search}
        title="Search your CRM"
        description="Use the search box in the header to find contacts, companies and deals."
      />
    );
  }

  const results = await globalSearch(query);
  return (
    <>
      <PageHeader title={`Results for “${query}”`} />
      <SearchResults results={results} />
    </>
  );
}
