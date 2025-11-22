import { createContext, useContext, useState, type ReactNode } from "react";

interface MenuContextProps {
    children: ReactNode;
}

interface MenuContextType {
    isSimplified: boolean;
    setIsSimplified: (value: boolean) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuContextProvider({ children }: MenuContextProps) {
    const [isSimplified, setIsSimplified] = useState(true);

    return <MenuContext.Provider value={{ isSimplified, setIsSimplified }}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error("useMenuContext must be used within a MenuProvider");
    }
    return context;
}
