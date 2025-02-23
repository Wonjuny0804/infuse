import Image from "next/image";

export const ProviderIcon = ({ provider }: { provider: string }) => {
  return (
    <div className="relative w-5 h-5">
      <Image
        src={`/icons/${provider}.svg`}
        alt={`${provider} logo`}
        fill
        className="object-contain"
        onError={(e) => {
          e.currentTarget.src = "/icons/default-mail.svg";
        }}
      />
    </div>
  );
};
