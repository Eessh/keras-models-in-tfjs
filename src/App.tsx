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
  };
  
  const processOutput = (
    output: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[],
    frameWidth: number,
    frameHeight: number
  ) => {
    const anchors = [0.57273, 0.677385, 1.87446, 2.06253, 3.33843, 5.47434, 7.88282, 3.52778, 9.77052, 9.16828];
    let netout = output;
    const nb_class = 1;
    const obj_threshold = 0.4;
    const nms_threshold = 0.3;
    const grid_h = netout.shape[0];
    const grid_w = netout.shape[1];
    let nb_box = netout.shape[2];
    
    const size = 4 + nb_class + 1;
    nb_box = 5;
    
    netout = netout.reshape(grid_h,grid_w,nb_box,size)
    
    const boxes = [];
    
    // decode the output by the network
    // netout[..., 4]  = _sigmoid(netout[..., 4])
    // netout[..., 5:] = netout[..., 4][..., np.newaxis] * _softmax(netout[..., 5:])
    // netout[..., 5:] *= netout[..., 5:] > obj_threshold
  };
  
  const _sigmoid = (x) => {
    x.forEach((num) => num = Math.exp(num));
    return 1. / (1. + Math.exp(-x));
  };
  
  const _softmax = (x: number, axis=-1, t=-100.) => {
    x = x - Math.max(x);
    if Math.min(x) < t:
      x = x/np.min(x)*t
    e_x = np.exp(x)
    return e_x / e_x.sum(axis, keepdims=True)
  };
  
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
