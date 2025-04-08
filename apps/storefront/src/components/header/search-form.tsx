"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type KeyboardEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useClickAnyWhere } from "usehooks-ts";

import { Button } from "@nimara/ui/components/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  type ComboboxOption,
} from "@nimara/ui/components/combobox";
import { Spinner } from "@nimara/ui/components/spinner";

import { DEFAULT_DEBOUNCE_TIME_IN_MS } from "@/config";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { searchService } from "@/services/search";

import { performSearch } from "./actions";

type SearchState = {
  highlightedOptionIndex: number;
  inputValue: string;
  options: ComboboxOption[];
  showOptions: boolean;
  status: "LOADING" | "IDLE";
};

const minLetters = 3;
const maxSearchSuggestions = 15;
const keyboardCodes = {
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  Enter: "Enter",
};
const initialSearchState: SearchState = {
  highlightedOptionIndex: -1,
  inputValue: "",
  options: [],
  status: "IDLE",
  showOptions: false,
};

export const SearchForm = ({ onSubmit }: { onSubmit?: () => void }) => {
  const ts = useTranslations("search");
  const tc = useTranslations("common");

  const pathname = usePathname();

  const router = useRouter();
  const [
    { inputValue, options, highlightedOptionIndex, showOptions, status },
    setSearchState,
  ] = useState<SearchState>(initialSearchState);

  const isLoading = status === "LOADING";
  const isIdle = status === "IDLE";
  const isNoOptionHighlighted = highlightedOptionIndex === -1;
  const isLastOptionHighlighted = highlightedOptionIndex === options.length;

  const debouncedInputValue = useDebounce(
    inputValue,
    DEFAULT_DEBOUNCE_TIME_IN_MS,
  );

  const resetSearchState = useCallback(
    () => setSearchState(initialSearchState),
    [],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.code === keyboardCodes.Enter) {
      event.preventDefault();
      resetSearchState();
      if (onSubmit) {
        onSubmit();
      }

      // Handle query search
      if (isNoOptionHighlighted || isLastOptionHighlighted) {
        router.push(paths.search.asPath({ query: { q: inputValue } }));

        return;
      }

      // Handle product selection
      const slug = options[highlightedOptionIndex].slug;

      router.push(slug ? paths.products.asPath({ slug: slug }) : "#");
    }

    if (event.code === keyboardCodes.ArrowUp) {
      event.preventDefault();

      const prevIndex = isNoOptionHighlighted
        ? options.length
        : highlightedOptionIndex - 1;

      setSearchState((state) => ({
        ...state,
        highlightedOptionIndex: prevIndex,
      }));
    }

    if (event.code === keyboardCodes.ArrowDown) {
      event.preventDefault();

      const nextIndex =
        highlightedOptionIndex < options.length
          ? highlightedOptionIndex + 1
          : -1;

      setSearchState((state) => ({
        ...state,
        highlightedOptionIndex: nextIndex,
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isNoOptionHighlighted || isLastOptionHighlighted) {
      router.push(paths.search.asPath({ query: { q: inputValue } }));
    }

    if (onSubmit) {
      onSubmit();
    }
    resetSearchState();
  };

  useClickAnyWhere(() =>
    setSearchState((prevState) => ({ ...prevState, showOptions: false })),
  );

  useEffect(() => {
    const inputValueLength = debouncedInputValue.length;

    if (inputValueLength === 0) {
      // Reset the search state when input is empty/cleared
      resetSearchState();

      return;
    }

    const isQueryLengthSufficient = inputValueLength >= minLetters;

    if (isQueryLengthSufficient) {
      void searchProducts(debouncedInputValue).then(({ results }) => {
        setSearchState((state) => ({
          ...state,
          status: "IDLE",
          options: results,
          showOptions: true,
        }));
      });
    }
  }, [debouncedInputValue]);

  useEffect(() => {
    resetSearchState();
  }, [pathname]);

  return (
    <form
      action={performSearch}
      aria-label={ts("site-wide-search-form")}
      role="search"
      onSubmit={handleSubmit}
    >
      <Combobox className="z-50">
        <ComboboxInput
          endAdornment={
            <Button
              aria-label={tc("submit")}
              size="icon"
              type="submit"
              variant="outline"
              className="cursor-pointer"
            >
              {isLoading ? (
                <Spinner size={16} />
              ) : (
                <Search aria-hidden={true} height={16} />
              )}
            </Button>
          }
          inputProps={{
            onChange: (event) =>
              setSearchState((state) => ({
                ...state,
                status:
                  event.target.value.length >= minLetters ? "LOADING" : "IDLE",
                inputValue: event.target.value,
              })),
            onKeyDown: handleKeyDown,
            placeholder: ts("search-placeholder"),
            value: inputValue,
          }}
        />

        <ComboboxGroup
          ariaLabel={ts("search-results")}
          expanded={isIdle && showOptions}
        >
          {options.map((suggestion, index) => (
            <ComboboxItem
              key={suggestion.id}
              isSelected={index === highlightedOptionIndex}
            >
              <Link
                className="flex gap-1 px-1.5 py-2 hover:cursor-pointer"
                href={
                  suggestion.slug
                    ? paths.products.asPath({ slug: suggestion.slug })
                    : "#"
                }
                onClick={() => resetSearchState()}
              >
                <Search className="self-center" height={16} />
                {suggestion.label}
              </Link>
            </ComboboxItem>
          ))}

          <ComboboxItem isSelected={isLastOptionHighlighted}>
            <Link
              className="flex gap-1 px-1.5 py-2 pl-8 hover:cursor-pointer"
              href={paths.search.asPath({ query: { q: inputValue } })}
              onClick={() => resetSearchState()}
            >
              {ts("search-for", { query: inputValue })}
            </Link>
          </ComboboxItem>
        </ComboboxGroup>

        {isLoading && <ComboboxEmpty>{ts("loading-text")}</ComboboxEmpty>}

        {isIdle && showOptions && !options.length && (
          <ComboboxEmpty>{ts("no-results")}</ComboboxEmpty>
        )}
      </Combobox>
    </form>
  );
};

const searchProducts = async (
  value: string,
): Promise<{ results: ComboboxOption[] }> => {
  const region = await getCurrentRegion();

  const result = await searchService.search(
    {
      query: value,
      limit: maxSearchSuggestions,
    },
    {
      languageCode: region.language.code,
      channel: region.market.channel,
    },
  );

  const products = result.ok ? result.data.results : [];

  return {
    results:
      products.map((result) => ({
        id: result.id,
        label: result.name,
        slug: result.slug,
      })) ?? [],
  };
};
