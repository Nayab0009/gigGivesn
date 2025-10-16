"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type PopupData = {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type PopupContextType = {
  showPopup: (data: PopupData) => void;
  hidePopup: () => void;
  popupData: PopupData | null;
  visible: boolean;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  const showPopup = (data: PopupData) => {
    setPopupData(data);
    setVisible(true);
  };

  const hidePopup = () => {
    setVisible(false);
    setPopupData(null);
  };

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup, popupData, visible }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error("usePopup must be used within PopupProvider");
  return context;
};
