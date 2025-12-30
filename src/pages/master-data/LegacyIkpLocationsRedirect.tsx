import { Navigate, useLocation } from "react-router-dom";

export default function LegacyIkpLocationsRedirect() {
  const location = useLocation();
  return <Navigate to={`/master-data/locations${location.search}`} replace />;
}
