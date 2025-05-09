
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const filters = [
  { value: null, label: "Todos" },
  { value: "estrategia", label: "Estratégias de marketing" },
  { value: "criativos", label: "Criativos para anúncios" },
  { value: "roteiros", label: "Roteiros para vídeos" },
  { value: "nomes", label: "Nomes de produtos/marcas" },
  { value: "copias", label: "Cópias de páginas" },
  { value: "outros", label: "Outros" }
];

type AIConversationFiltersProps = {
  onFilterChange: (type: string | null) => void;
};

const AIConversationFilters = ({ onFilterChange }: AIConversationFiltersProps) => {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  const handleFilterClick = (type: string | null) => {
    setActiveFilter(type);
    onFilterChange(type);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <Badge
          key={filter.value || 'all'}
          variant="outline"
          className={cn(
            "cursor-pointer hover:bg-primary/10 hover:border-primary/50",
            activeFilter === filter.value
              ? "bg-primary/20 border-primary text-primary"
              : "bg-background"
          )}
          onClick={() => handleFilterClick(filter.value)}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
};

export default AIConversationFilters;
