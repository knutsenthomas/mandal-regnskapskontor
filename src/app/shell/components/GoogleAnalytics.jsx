import { useLocation } from "react-router-dom";
import { useSite } from "@/contexts/SiteContext";
import React from "react";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

// Optional measurements load only after the first-party consent choice.
const GoogleAnalytics = () => {
  const { pathname } = useLocation();
  const { gaId } = useSite();
  const [allowed, setAllowed] = React.useState(
    () => window.SitePrivacy?.allows("analytics") === true,
  );
  useEffect(() => {
    const sync = () =>
      setAllowed(window.SitePrivacy?.allows("analytics") === true);
    window.addEventListener("siteprivacychange", sync);
    sync();
    return () => window.removeEventListener("siteprivacychange", sync);
  }, []);
  useEffect(() => {
    window.SitePrivacy?.setMeasurementId(gaId);
  }, [gaId]);
  useEffect(() => {
    window.SitePrivacy?.pageView();
    setAllowed(window.SitePrivacy?.allows("analytics") === true);
  }, [pathname]);
  return allowed ? (
    <Analytics
      beforeSend={(event) => window.SitePrivacy?.cleanEvent(event) ?? null}
    />
  ) : null;
};

export { GoogleAnalytics };
