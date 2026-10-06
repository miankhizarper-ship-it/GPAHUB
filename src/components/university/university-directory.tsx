"use client";

import * as React from "react";
import { Search } from "lucide-react";
import type { University } from "@/types/university";
import { UniversityCard } from "@/components/university/university-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * University directory — Client Component.
 *
 * Receives all published universities as props from the Server
 * Component parent. Filters client-side for instant search + city
 * filter without server round-trips. The list is small (10–20
 * universities) so client-side filtering is appropriate.
 */
export function UniversityDirectory({
  universities,
}: {
  universities: readonly University[];
}) {
  const [query, setQuery] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState<string>("all");

  // Extract unique cities for the filter dropdown.
  const cities = React.useMemo(() => {
    const set = new Set(universities.map((u) => u.city));
    return Array.from(set).sort();
  }, [universities]);

  const filtered = React.useMemo(() => {
    let result = universities;

    if (cityFilter !== "all") {
      result = result.filter((u) => u.city === cityFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.slug.includes(q) ||
          u.city.toLowerCase().includes(q),
      );
    }

    return result;
  }, [universities, query, cityFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by name, city, or abbreviation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search universities"
          />
        </div>
        {cities.length > 1 && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "university" : "universities"}
        {cityFilter !== "all" && ` in ${cityFilter}`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No universities found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            No universities match &ldquo;{query}&rdquo;
            {cityFilter !== "all" && ` in ${cityFilter}`}. Try a different search
            or clear the filters.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UniversityCard key={u.slug} university={u} />
          ))}
        </ul>
      )}
    </div>
  );
}
