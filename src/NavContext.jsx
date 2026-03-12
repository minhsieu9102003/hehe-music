import { createContext, useContext } from "react";

export const NavContext = createContext({ page: "home", go: () => { } });
export function useNav() { return useContext(NavContext); }
