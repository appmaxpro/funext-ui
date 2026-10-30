import { useLazyRef } from "~/ui";
import React, { useEffect } from "react";
import { useEvalDataContext } from "~/context";
import { EMPTY_ARRAY, type Domains } from "~/utils";
import type { DomainGet } from "~/utils/filter";

export function useEvalDomain(domainGet: DomainGet|undefined, deps?: string[]) {
  const ctx = useEvalDataContext();

  const evalDeps = useLazyRef(()=> deps) 
  const domain = useLazyRef(()=> typeof domainGet === "function"
      ? domainGet(ctx) as Domains
      : domainGet && Array.isArray(domainGet) && domainGet.length
        ? (domainGet as Domains)
        : undefined,) 
  
  useEffect(() => {
    
  }, deps ? [ctx] : EMPTY_ARRAY);
  
  return domain && Array.isArray(domain) && domain.length ? domain as Domains : undefined  
}
