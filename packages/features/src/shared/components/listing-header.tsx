import Image from "next/image";

type Props = {
  name: string;
  thumbnail?: { alt?: string; url: string } | null;
};

export const ListingHeader = ({ name, thumbnail }: Props) => {
  return (
    <>
      <div className="grid basis-full items-center justify-center gap-4 md:flex">
        <h1 className="text-primary text-center text-2xl">{name}</h1>
      </div>
      {thumbnail && (
        <div className="relative h-40 w-full sm:h-56 md:h-72">
          <Image
            src={thumbnail.url}
            alt={thumbnail.alt || name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
    </>
  );
};
