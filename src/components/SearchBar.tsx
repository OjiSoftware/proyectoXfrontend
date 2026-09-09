// SearchBar.tsx
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SearchBarProps } from "@/types/search.types";

type Props = Pick<SearchBarProps, "value" | "onChange" | "placeholder"> & {
    containerClassName?: string;
    inputClassName?: string;
    iconClassName?: string;
    onSubmit?: (value: string) => void;
};

export default function SearchBar({
    value,
    onChange,
    placeholder = "Encontrá lo que tu campo necesita...",
    containerClassName = "",
    inputClassName = "",
    iconClassName = "",
    onSubmit,
}: Props) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSubmit) {
            onSubmit(value);
        }
    };

    return (
        <div className={`relative w-full max-w-3xl ${containerClassName}`}>
            <MagnifyingGlassIcon
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none ${iconClassName}`}
            />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`
                    w-full pl-10 pr-3 rounded-lg
                    outline-none transition
                    ${inputClassName}
                `}
            />
        </div>
    );
}
