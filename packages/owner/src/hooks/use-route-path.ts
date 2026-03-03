import { useLocation, useMatches, useParams } from 'react-router';

export function useRoutePath() {
  let { pathname } = useLocation();
  const params = useParams();
  return Object.entries(params).reduce((path: any, [key, value]) => {
    return path.replace(`/${value}/`, `/:${key}/`);
  }, pathname.endsWith("/") ? pathname : pathname+"/");

  // Filter and map the matches to get the path patterns
  //const matches = useMatches();
  //const pathPatterns = matches.map(match => match.route?.path).filter(Boolean);
  // pathPatterns might be ["/", "messages", ":id"] for the URL "/messages/123"

  
}