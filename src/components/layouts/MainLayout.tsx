import type { FC, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <main className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      {children}
    </main>
  );
};

export default MainLayout;
