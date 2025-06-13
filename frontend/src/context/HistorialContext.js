import { createContext, useContext } from "react";

export const HistorialContext = createContext(null);

export const useHistorial = () => useContext(HistorialContext);
