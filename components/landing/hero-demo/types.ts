export type HeroGroupId = "all" | "Research" | "Inspiration" | "Build" | "Learn";

export type HeroIcon =
  | ([string, { [key: string]: string | number }][])[]
  | readonly (readonly [
      string,
      { readonly [key: string]: string | number },
    ])[];

export type HeroGroup = {
  id: HeroGroupId | string;
  label: string;
  icon: HeroIcon;
  color?: string | null;
};

export type HeroBookmark = {
  id: string;
  title: string;
  domain: string;
  url: string;
  date: string;
  favicon: string;
  group: Exclude<HeroGroupId, "all">;
};
