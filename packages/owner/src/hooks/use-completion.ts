import uniq from "lodash/uniq";
import { useCallback, useMemo } from "react";
import { DEFAULT_COMPLETION_PAGE_SIZE } from "~/utils/constant";
import { DataSource } from "~/utils/data";
import type { DataContext, Domain, Domains } from "~/utils/data-types";

export function useCompletion(options: {
  target: string;
  targetName?: string;
  targetSearch?: string[];
  fetchFields?: string[];
  limit?: number;
  sortBy?: string;
}) {
  const {
    target,
    targetName,
    targetSearch,
    fetchFields,
    sortBy,
    limit = DEFAULT_COMPLETION_PAGE_SIZE,
  } = options;

  const dataSource = useMemo(() => new DataSource(target), [target]);
  
  const names = useMemo(
    () =>
      uniq(
        [[targetName], targetSearch]
          .flat()
          .filter((name) => name !== "id" && Boolean(name)),
      ) as string[],
    [targetName, targetSearch],
  );

  const search = useCallback(
    async (
      term: string,
      opts?: {
        _domain?: Domains;
        _context?: DataContext;
        offset?: number;
      },
    ) => {
      const { _domain, _context, offset } = opts || {};

      let terms:Domains|undefined = undefined;
      if (term) {
        terms = []
        for (let i =0; i < names.length -1; i++) {
          terms.push('|' as any)
        }
        for (let i =0; i < names.length; i++) {
          terms.push([names[i], 'ilike', term])
        }
      }

      let domain:Domains =  [];

      if (_domain?.length) {
          domain.push(...(_domain as Domain[]))
      }

      if (terms) {
          domain.push(...terms)
      }

      return dataSource.search({
        //translate: true,
        order: sortBy?.split?.(","),
        limit,
        offset,
        fields: uniq(["id", ...(fetchFields || []), ...names]),
        context: _context,
        domain
      });
    },
    [dataSource, sortBy, limit, names, fetchFields],
  );

  return search;
}
