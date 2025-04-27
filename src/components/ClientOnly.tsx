import React from "react";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [is_client, set_is_client] = React.useState(false);
  React.useEffect(() => {
    if (!is_client) {
      set_is_client(true);
    }
  }, []);
  if (!is_client) {
    return undefined;
  }

  return children;
}
