"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const {
    open,
  } = useSidebar();

  return (
    <main className={`flex-1 overflow-y-auto p-6 md:p-8  ${open? "max-w-[calc(100vw-16rem)]":"w-[calc(100vw-50px)]"}  `}>
      {children}
    </main>
  );
};
