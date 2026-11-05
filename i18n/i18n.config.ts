// vue-i18n picks plural forms as 0 | 1 | many by default; Russian needs one / few / many
function russianPlural(choice: number, choicesLength: number): number {
  if (choice === 0) return 0;
  const mod10 = choice % 10;
  const mod100 = choice % 100;
  const teen = mod100 > 10 && mod100 < 20;
  if (!teen && mod10 === 1) return 1;
  if (!teen && mod10 >= 2 && mod10 <= 4) return 2;
  return choicesLength < 4 ? 2 : 3;
}

export default defineI18nConfig(() => ({
  pluralRules: {
    ru: russianPlural,
  },
}));
