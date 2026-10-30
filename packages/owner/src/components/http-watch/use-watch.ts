import { i18n } from "~/utils/i18n";
import { $request, $use } from "~/utils/http";
import { useCallback, useEffect, useRef, useState } from "react";
import { useErrorStore } from "~/store/errors";

type Pending = () => Promise<any>;

function isLogin(input: RequestInfo | URL) {
  const url = input instanceof Request ? input.url : input.toString();
  return url.includes("/auth/");
}

export function useHttpWatch() {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState<Pending[]>([]);
  
  const resume = useCallback(() => {
    const all = [...pending];
    setPending([]);
    all.forEach((fn) => fn());
  }, [pending]);

  const pushError = useErrorStore((state)=> state.push)

  useEffect(() => {
    return $use(async (args, next) => {
      // Don't intercept:
      // - Request with silent option
      // - Login request
      if (args.options?.silent || isLogin(args.input)) return next();
      
      setCount((count) => count + 1);
      try {
        const res = await next();
        if (res instanceof Response) {
          if (res.status === 401) {
            setCount((count) => count - 1);
            return new Promise((resolve, reject) => {
              setPending((pending) => [
                ...pending,
                () => $request(args.input, args.init).then(resolve, reject),
              ]);
            });
          } else if (res.status === 403) {
            throw new Error(i18n.get("Access error"))
          } 
        }
        return res;
      } 
      catch(e){
          console.error("useHttpWatch error:", e)
          pushError(e);
          throw e;
      }
      finally {
        setCount((count) => count - 1);
      }
    });
  }, []);

  return pending.length ? { count, resume } : { count };
}
