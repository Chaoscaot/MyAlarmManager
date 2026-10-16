import React from "react";
import PageHeader from "~/app/_components/page-header";

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PageHeader
        title="Einstellungen"
        meta="Funkrufname, Anzeige und Anbindung an Alamos"
      />
      <div className="max-w-2xl px-4 md:px-6">{children}</div>
    </>
  );
}

export default Layout;
