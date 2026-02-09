// src/components/Seo/SEO.tsx
import SeoHelmet from "./SeoHelmet";
import { SEO_DATA } from "@/constants/seo-config";
import { useCurrentLang } from "@/utils/i18n-router";

type PageKey = keyof typeof SEO_DATA;

interface Props {
  page: PageKey;
  slug?: string;
  image?: string;
}

export default function SEO({ page, slug = "", image }: Props) {
  const lang = useCurrentLang();
  const seo = SEO_DATA[page][lang as "vi" | "en"];
  return (
    <SeoHelmet
      title={seo.title}
      description={seo.description}
      keywords={seo.keywords}
      slug={slug}
      image={image}
    />
  );
}
