import { RichText } from "@nimara/ui/components/rich-text/rich-text";

type Props = {
    description?: unknown;
};

export const CollectionDescription = ({ description }: Props) => {
    if (!description) {
        return null;
    }

    return (
        <div>
            <RichText contentData={description as Parameters<typeof RichText>[0]["contentData"]} />
        </div>
    );
};

