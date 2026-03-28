import { useCallback, useEffect, useRef, useState } from "react";

import { Dialog, Fade, Portal } from "@funext/ui";

import { type SessionInfo, session } from "~/utils/session";

import { Loader } from "~/components";
//import { LoginForm } from "../login-form";
import { useHttpBlock } from "./use-block";
import { useHttpWatch } from "./use-watch";
import { i18n } from "~/utils/i18n";

import styles from "./http-watch.module.scss";
import { useSession } from "~/hooks/use-session";
import { useRouter } from "~/hooks/use-router";

export function HttpWatch() {
  const { count, resume } = useHttpWatch();
  return (
    <>
      <HttpIndicator count={count} />
      <HttpBlock count={count} disabled={Boolean(resume)} />
      <HttpAuth resume={resume} />
    </>
  );
}

function HttpIndicator({ count }: { count: number }) {
  const [show, setShow] = useState(count > 0);

  const timerRef = useRef<number>();
  const mountRef = useRef(false);
  const countRef = useRef(count);

  const handleShow = useCallback(() => {
    countRef.current = count;
    if (timerRef.current && count > 0) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (mountRef.current) setShow(countRef.current > 0);
      timerRef.current = undefined;
    }, 300);
  }, [count]);

  useEffect(() => {
    mountRef.current = true;
    return () => {
      mountRef.current = false;
    };
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);
  useEffect(handleShow, [handleShow]);

  return (
    <Portal>
      <Fade in={show} mountOnEnter unmountOnExit>
        <div className={styles.indicator}>{i18n.get("Loading...")}</div>
      </Fade>
    </Portal>
  );
}

function HttpBlock({ count, disabled }: { count: number; disabled?: boolean }) {
  const [wait, setWait] = useState(false);
  const [block, setBlock] = useState(false);
  const blocked = useHttpBlock((state) => state.blocked);

  const _block = !disabled && (blocked || wait);
  const active = blocked || count > 0;

  useEffect(() => {
    const delay = active ? 2000 : 300;
    const timer = setTimeout(() => {
      setWait(active);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [active, count]);

  useEffect(() => {
    if (_block) {
      // Delay block component in order to have correct target in click event listeners.
      // Needed for correct event target in click away handling.
      const timer = setTimeout(() => setBlock(_block), 100);

      // Block keyboard events
      const handler = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
      };
      document.addEventListener("keydown", handler, true);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handler, true);
      };
    } else {
      setBlock(_block);
    }
  }, [_block]);

  return (
    <Portal data-loading={block ? "true" : undefined}>
      <Fade in={block} mountOnEnter unmountOnExit>
        <div className={styles.block}>
          <Fade in={wait} mountOnEnter unmountOnExit>
            <div className={styles.wait}>
              <div className="flex flex-col items-center justify-center w-full">
                <Loader />
                <span>{i18n.get("Please wait...")}</span>
              </div>
            </div>
          </Fade>
        </div>
      </Fade>
    </Portal>
  );
}

function HttpAuth({ resume }: { resume?: () => void }) {
  //const { state } = useLocation();
  //const navigate = useNavigate();
  const router = useRouter()
  const { data: info } = useSession();
  const prev = useRef(session.info?.user?.login).current;

  useEffect(() => {
    const curr = info?.user?.login;
    if (prev !== curr) {
      console.error("-----------login-change-----------");
      window.location.reload();
    } else if (resume && router) {
      //navigate('/auth/login', { state: {...(state || {}), resume} });
      router.navigate("/auth/login");
    }
  }, [prev, info, resume]);
  return null;
  /*
  const handleSuccess = useCallback(
    (info: SessionInfo) => {
      const curr = info.user?.login;
      if (prev !== curr) {
        console.error("-----------login-change-----------");
        window.location.reload();
      } else if(resume){
        return navigate('/auth/login', { replace: true, state: {...(state || {}), resume} });
      }
    },
    [prev, resume],
  );

  
  return (
    <Dialog open={Boolean(resume)} fullWidth size="md">
      <Dialog.Body className="p-0">
        <LoginForm onSuccess={handleSuccess} />
      </Dialog.Body>
    </Dialog>
  );*/
}
