import { strings, type StringKey } from "./strings";

/** The whole i18n runtime, deliberately: a typed lookup plus `{{var}}`
    interpolation, nothing else. No plural rules, no namespace loading, no
    provider — see strings.ts's header for why a full i18n library isn't
    warranted yet. */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  const template = strings[key];
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
