import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        startIcon={<Search />}
        endIcon={value ? (
          <button onClick={() => onChange("")} className="hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : undefined}
      />
    </div>
  );
}
