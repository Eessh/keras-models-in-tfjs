import React, { createContext, useContext, useState } from "react";

export type TPrediction = number[];

type TGlobalContext = {
  videoLoaded: boolean,
  prediction: TPrediction,
  setVideoLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setPrediction: React.Dispatch<React.SetStateAction<TPrediction>>
};

type TGlobalContextProviderProps = {
  children: React.ReactNode | React.ReactNode[]
};

const defaultContextValue: TGlobalContext = {
  videoLoaded: false,
  prediction: [0, 0, 0, 0, 0, 0, 1],
  setVideoLoaded: () => {},
  setPrediction: () => {},
};

const GlobalContext = createContext<TGlobalContext>(defaultContextValue);

const GlobalContextProvider = ({ children }: TGlobalContextProviderProps) => {
  const [videoLoaded, setVideoLoaded] = useState<boolean>(defaultContextValue.videoLoaded);
  const [prediction, setPrediction] = useState<TPrediction>(defaultContextValue.prediction);

  return (
    <GlobalContext.Provider value={{
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