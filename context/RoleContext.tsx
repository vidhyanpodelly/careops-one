"use client";

import { createContext, useContext } from "react";

export const RoleContext = createContext<"OWNER" | "STAFF">("OWNER");

export const useRole = () => useContext(RoleContext);
