import Image from "next/image";

type Props = {
    name: string;
    thumbnail?: { alt?: string, url: string; } | null;
};

export const CollectionHeader = ({ name, thumbnail }: Props) => {
    return (
        <>
            <div className="grid basis-full items-center justify-center gap-4 md:flex">
                <h1 className="text-primary text-center text-2xl">{name}</h1>
            </div>
            {thumbnail && (
                <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl">
                    <Image
                        src={thumbnail.url}
                        alt={thumbnail.alt || name}
                        fill
                        sizes="(max-width: 960px) 100vw, 50vw"
                        className="object-cover"
                    />
                </div>
            )}
        </>
    );
};

