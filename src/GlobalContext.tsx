import React, { createContext, useContext, useState } from "react";

export type TPrediction = number[];

type TGlobalContext = {
  blazefaceLoaded: boolean,
  mobileNetV2Loaded: boolean,
  faceapiModelsLoaded: boolean,
  videoLoaded: boolean,
  prediction: TPrediction,
  faceapiEmotion: string,
  setBlazefaceLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setMobileNetV2Loaded: React.Dispatch<React.SetStateAction<boolean>>,
  setFaceapiModelsLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  setPrediction: React.Dispatch<React.SetStateAction<TPrediction>>,
  setFaceapiEmotion: React.Dispatch<React.SetStateAction<string>>,
};

type TGlobalContextProviderProps = {
  children: React.ReactNode | React.ReactNode[]
};

const defaultContextValue: TGlobalContext = {
  blazefaceLoaded: false,
  mobileNetV2Loaded: false,
  faceapiModelsLoaded: false,
  videoLoaded: false,
  prediction: [0, 0, 0, 0, 0, 0, 1],
  faceapiEmotion: "neutral",
  setBlazefaceLoaded: () => {},
  setMobileNetV2Loaded: () => {},
  setFaceapiModelsLoaded: () => {},
  setVideoLoaded: () => {},
  setPrediction: () => {},
  setFaceapiEmotion: () => {},
};

const GlobalContext = createContext<TGlobalContext>(defaultContextValue);

const GlobalContextProvider = ({ children }: TGlobalContextProviderProps) => {
  const [blazefaceLoaded, setBlazefaceLoaded] = useState<boolean>(defaultContextValue.blazefaceLoaded);
  const [mobileNetV2Loaded, setMobileNetV2Loaded] = useState<boolean>(defaultContextValue.mobileNetV2Loaded);
  const [faceapiModelsLoaded, setFaceapiModelsLoaded] = useState<boolean>(defaultContextValue.faceapiModelsLoaded);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(defaultContextValue.videoLoaded);
  const [prediction, setPrediction] = useState<TPrediction>(defaultContextValue.prediction);
  const [faceapiEmotion, setFaceapiEmotion] = useState<string>(defaultContextValue.faceapiEmotion);

  return (
    <GlobalContext.Provider value={{
      blazefaceLoaded, setBlazefaceLoaded,
      mobileNetV2Loaded, setMobileNetV2Loaded,
      faceapiModelsLoaded, setFaceapiModelsLoaded,
      videoLoaded, setVideoLoaded,
      prediction, setPrediction,
      faceapiEmotion, setFaceapiEmotion,
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