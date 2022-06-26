import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import './App.css';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  
  useEffect(() => {
    loadVideoStream();
    loadModels();
    // loadMobilenetModel();
    const interval = setInterval(() => {
      runModel();
      // runMobilenetModel();
    }, 200);
    return() => {
      clearInterval(interval);
    };
  }, []);
  
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
  
  const loadModels = async () => {
    const model = await tf.loadLayersModel("/converted_models/yolov2_tiny_face/model.json");
    if (model!==null) {
      console.log("Log: Model loaded: ", model);
      setModel(model)
    }
  };
  
  const loadMobilenetModel = async () => {
    const model = await tf.loadLayersModel("/converted_models/MUL_KSIZE_MobileNet_v2_best/model.json");
    if (model !== null) {
      console.log("Log: Loaded MUL_KSIZE_MobileNet_v2_best model: ", model);
      setModel(model);
    }
  };
  
  const runModel = () => {
    if (videoRef!==null && videoRef.current!==null && model!==null) {
      const tfImg = tf.browser.fromPixels(videoRef.current);
      // const smallImg = tf.image.resizeBilinear(tfImg, [416, 416]);
      const smallImg = tfImg.resizeBilinear([416, 416]);
      const expanded = smallImg.expandDims(0);
      // const resized = tf.cast(smallImg, "float32");
      // const t4d = tf.tensor4d(Array.from(resized.dataSync()), [1, 416, 416, 3]);
      // model.predict(t4d, {batchSize: 64});
      const output = model.predict(expanded, {batchSize: 64, verbose: true});
      console.log("Log: Output: ", output)
    }
  }
  
  const runMobilenetModel = () => {
    if (videoRef!==null && videoRef.current!==null && videoRef.current!==undefined && model!==null) {
      const tfImg = tf.browser.fromPixels(videoRef.current);
      // const smallImg = tfImg.resizeBilinear([48, 48]);
      // const resized = tf.cast(smallImg, "int32");
      // const expanded = smallImg.expandDims(0);
      const t4d = tf.tensor4d(Array.from(tfImg.dataSync()), [1, 48, 48, 1]);
      const output = model.predict(t4d);
      console.log("Log: Output: ", output)
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
