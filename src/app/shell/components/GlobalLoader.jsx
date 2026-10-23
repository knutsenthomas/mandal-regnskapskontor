import { useSite } from "@/contexts/SiteContext";
import React from "react";
import { ContentContext } from "@/contexts/ContentContext";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const GlobalLoader = ({ children }) => {
  const { loading: siteLoading } = useSite();
  const { loading: contentLoading } = React.useContext(ContentContext);
  const [forceClose, setForceClose] = React.useState(false);
  const hasPendingInitialLoad = siteLoading || contentLoading;
  const isBlocking = hasPendingInitialLoad && !forceClose;

  React.useEffect(() => {
    let timer;
    if (hasPendingInitialLoad) {
      // Force exit loading state after 8 seconds to prevent indefinite freezing.
      timer = setTimeout(() => {
        console.warn("GlobalLoader timed out. Forcing app to render.");
        setForceClose(true);
      }, 8000);
    } else {
      setForceClose(false);
    }
    return () => clearTimeout(timer);
  }, [hasPendingInitialLoad]);

  if (isBlocking) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-4 text-card-foreground shadow-xl"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-sm font-semibold tracking-wide">
            Laster nettstedet...
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export { GlobalLoader };
