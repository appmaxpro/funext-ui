import { useCallback, useEffect, useState } from "react";

import { type SessionInfo, session, loadSession } from "~/utils/session";
import { useAsync } from "./use-async";
import { useLocalStorage } from "./use-local-storage";


const login = session.login.bind(session);

export function useSession(force?: boolean) {
  const [token, setApiToken] = useLocalStorage("ssToken");
  const doLoadSession = useCallback(()=> loadSession(token, setApiToken, force), [setApiToken])
  const { state, error } = useAsync(doLoadSession);
  const [data, setData] = useState<SessionInfo | null>(session.info);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    return session.subscribe((info) => {
      setData(info);
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      const { redirectUrl: url } = await session.logout();
      if(!url) {
        //window.location.reload();
      }
      //@ts-ignore
      setRedirectUrl(url ?? "");
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
  }, [setRedirectUrl]);

  return {
    state,
    data,
    error,
    login,
    logout,
    redirectUrl,
  };
}


