import { useCallback, useMemo } from "react";
import type { Domain, Domains, SearchOptions } from "~/utils";
import { DataStore, DEFAULT_COMPLETION_PAGE_SIZE, EMPTY_ARRAY } from "~/utils";

function one(input: Array<string | undefined>): string[] {
  return Array.from(new Set(input.filter(Boolean).map(String)));
}
export function useDataStore(config: {
  dataStore: DataStore;
  targetName?: string;
  targetSearch?: string[];
}) {
  const {
    dataStore,
    targetName,
    targetSearch
  } = config;

  //const dataSource = useMemo(() => new DataStore(target), [target]);

  const options = useMemo(() => {
    const all = one([targetName, ...(targetSearch ?? EMPTY_ARRAY)])
      .map((name) => name.split(" "))
      .filter((names) => names[0] !== "id");

    const names: string[] = [];
    const ops: string[] = [];
    all.forEach(([name, op]) => {
      if (!names.includes(name)) {
        names.push(name);
        ops.push(op ?? "ilike");
      }
    });

    return {
      names,
      ops,
      fields: one([...(dataStore.options.fields ?? EMPTY_ARRAY), ...names]),
    };
  }, [targetName, targetSearch]);

  const search = useCallback(
    async (
      term: string,
      opts?: Partial<Omit<SearchOptions & { reset?: boolean }, "fields">>,
    ) => {
      const { domain: _domain, reset, ...rem } = opts || {};

      let terms: Domains | undefined = undefined;
      const { names, ops, fields } = options;
      if (term && term.trim().length) {
        terms = [];
        for (let i = 0; i < names.length - 1; i++) {
          terms.push("|" as any);
        }
        for (let i = 0; i < names.length; i++) {
          terms.push([names[i], ops[i] as any, term]);
        }
      }

      let domain: Domains = [];

      if (_domain?.length) {
        domain.push(...(_domain as Domain[]));
      }

      if (terms) {
        domain.push(...terms);
      }

      return dataStore.search(
        {
          //translate: true,
          ...rem,
          fields,
          domain,
        },
        reset,
      );
    },
    [dataStore, options],
  );

  return search;
}
