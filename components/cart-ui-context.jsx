"use client"
import { createContext, useContext, useState } from "react"

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const value = {
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    toggleCart: () => setCartOpen((s) => !s),
    authOpen,
    openAuth: () => setAuthOpen(true),
    closeAuth: () => setAuthOpen(false),
  }
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  return useContext(UIContext)
}
