import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import './App.css';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  
  useEffect(() => {
    loadModels();
    loadVideoStream();
    const interval = setInterval(() => {
      runModel()
    }, 100);
    return() => {
      clearInterval(interval)
    };
  }, []);
  
  const loadModels = async () => {
    const model = await tf.loadLayersModel("/converted_model/model.json");
    if (model!==null) {
      console.log("Log: Model loaded: ", model);
      setModel(model);
    }
  };
  
  const loadVideoStream = () => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then((videoStream) => {
      videoRef.current!.srcObject = videoStream;
      console.log("Log: VideoStream obtained :)");
    })
    .catch((err) => {
      console.log("Log: Error while accessing VideoStream: ", err);
    });
  };
  
  const runModel = () => {
    if (videoRef!==null && videoRef.current!==null && model!==null) {
      const tensor = tf.browser.fromPixels(videoRef.current);
      model.predict(tensor);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          muted
          playsInline
        ></video>
      </header>
    </div>
  )
};

export default App;
