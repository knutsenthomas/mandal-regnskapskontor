import React from "react";

const LoginPageWithBoundary = React.lazy(
  () => import("@/pages/admin/LoginPageFixed"),
);

export { LoginPageWithBoundary };
