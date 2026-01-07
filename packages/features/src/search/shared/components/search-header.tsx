import { getTranslations } from "next-intl/server";

type Props = {
    category?: string;
    collection?: string;
    query?: string;
};

export const SearchHeader = async ({ query, category, collection }: Props): Promise<string> => {
    const t = await getTranslations();

    const formatFilterHeader = (filterValue?: string) => {
        if (!filterValue) {
            return null;
        }

        const items = filterValue.split(",").map((item) =>
            item
                .trim()
                .replace(/-/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase()),
        );

        if (items.length === 1) {
            return items[0];
        }
        if (items.length === 2) {
            return `${items[0]} ${t("common.and")} ${items[1]}`;
        }

        return `${items.slice(0, -1).join(", ")} ${t("common.and")} ${items[items.length - 1]}`;
    };

    if (query) {
        return t("search.results-for", { query });
    }

    const categoryHeader = formatFilterHeader(category);
    const collectionHeader = formatFilterHeader(collection);

    if (categoryHeader) {
        return categoryHeader;
    }
    if (collectionHeader) {
        return collectionHeader;
    }

    return t("search.all-products");
};

