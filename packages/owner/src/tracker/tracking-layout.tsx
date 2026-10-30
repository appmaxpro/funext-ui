import ServerProvider from "./server-provider";
import { TrackingPage } from "./pages";
import { useSession } from "~/hooks/use-session";
import { useTrackerSession } from "./store/session";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { Loader } from "~/components";
import preloadImages from './map/preloadImages';
import maplibregl from "maplibre-gl";

const mapImages = preloadImages();

function TackingLayout() {
  const { data } = useSession();
  const updateUser = useTrackerSession((state) => state.updateUser);
  const user = useTrackerSession((state) => state.user);

  useAsyncEffect(async () => {
    
    await mapImages;

    if (!user && data?.features?.tracker) {
      const tracker = data!.features!.tracker!;

      let { domain, token } = tracker;
      const response = await fetch(`${domain}/api/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        updateUser(await response.json());
      } else {
        window.location.href = "/";
        //window.sessionStorage.setItem('postLogin', pathname + search);
        //navigate(newServer ? '/register' : '/login', { replace: true });
      }
    }
  }, [data]);

  if (!data?.features?.tracker) {
    return null;
  }

  if ("supported" in maplibregl && !(maplibregl.supported as any)()) {
    <div>Your browser does not support MapLibre GL</div>;
  }

  if (user == null) {
    return <Loader />;
  }

  return (
    <ServerProvider>
      <TrackingPage />
    </ServerProvider>
  );
}

export default TackingLayout;
