import React, { createContext, useContext, useState } from "react";

export type TPrediction = number[];

type TGlobalContext = {
  blazefaceLoaded: boolean,
  mobileNetV2Loaded: boolean,
  videoLoaded: boolean,
  prediction: TPrediction,
  setBlazefaceLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setMobileNetV2Loaded: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setPrediction: React.Dispatch<React.SetStateAction<TPrediction>>
};

type TGlobalContextProviderProps = {
  children: React.ReactNode | React.ReactNode[]
};

const defaultContextValue: TGlobalContext = {
  blazefaceLoaded: false,
  mobileNetV2Loaded: false,
  videoLoaded: false,
  prediction: [0, 0, 0, 0, 0, 0, 1],
  setBlazefaceLoaded: () => {},
  setMobileNetV2Loaded: () => {},
  setVideoLoaded: () => {},
  setPrediction: () => {},
};

const GlobalContext = createContext<TGlobalContext>(defaultContextValue);

const GlobalContextProvider = ({ children }: TGlobalContextProviderProps) => {
  const [blazefaceLoaded, setBlazefaceLoaded] = useState<boolean>(defaultContextValue.blazefaceLoaded);
  const [mobileNetV2Loaded, setMobileNetV2Loaded] = useState<boolean>(defaultContextValue.mobileNetV2Loaded);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(defaultContextValue.videoLoaded);
  const [prediction, setPrediction] = useState<TPrediction>(defaultContextValue.prediction);

  return (
    <GlobalContext.Provider value={{
      blazefaceLoaded, setBlazefaceLoaded,
      mobileNetV2Loaded, setMobileNetV2Loaded,
      videoLoaded, setVideoLoaded,
      prediction, setPrediction,
    }}>
      { children }
    </GlobalContext.Provider>
  );
};

const useGlobalContext = (): TGlobalContext => {
  const context = useContext(GlobalContext);
  if (context===null || context===undefined) {
    throw new Error("Error: useGlobalContext() can only be used inside of GlobalContextProvider.");
  }
  return context;
};

export {
  GlobalContextProvider,
  useGlobalContext
};