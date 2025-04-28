export function generatePath(
  pathname: string,
  query?: any,  
  hash?: string | null | undefined,
) {

  if(typeof query === 'string') {
    const params = new URLSearchParams(query);
    query = Array.from(params.entries()).reduce((acc, [name, value]) => 
      ({...acc, [name]: acc[name] ? [...(Array.isArray(acc[name]) ? acc[name] : [acc[name]]), value] : value}), {} as any)
  }

  const remainingQuery = { ...query };

  // Replace slugs, and remove them from the `query`
  let asPath = pathname.replace(/\[{1,2}(.+?)]{1,2}/g, ($0, slug: string) => {
    if (slug.startsWith("...")) slug = slug.replace("...", "");

    const value = remainingQuery[slug]!;
    delete remainingQuery[slug];
    if (Array.isArray(value)) {
      return value.map((v) => encodeURIComponent(v)).join("/");
    }
    return value !== undefined ? encodeURIComponent(String(value)) : "";
  });

  // Remove any trailing slashes; this can occur if there is no match for a catch-all slug ([[...slug]])
  asPath = removeTrailingSlash(asPath);

  // Append remaining query as a querystring, if needed:
  const params = createSearchParams(remainingQuery);
  if (params) asPath += `?${params.toString()}`;
  if (hash) asPath += hash;

  return asPath;
}

export function createSearchParams(query?: any) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    const arr = (Array.isArray(value ?? []) ? value ?? [] : [value]) as [];
    arr.forEach((v) => {
      params.append(key, v);
    });
  });
  
  return params.size > 0 ? params : null;
}

function removeTrailingSlash(path: string) {
  path = path.replaceAll("//", "/");
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}


