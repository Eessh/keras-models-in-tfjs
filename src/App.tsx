import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import MiniXception from "./MiniXception";
import TinyXception from "./TinyXception";
import './App.css';

function App() {
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [blazefaceModel, setBlazefaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
  // const [model, setModel] = useState<tf.LayersModel | null>(null);
  
  // useEffect(() => {
  //   loadVideoStream();
  //   loadBlazefaceModel();
  //   // loadModels();
  //   loadMobilenetModel();
  //   const interval = setInterval(() => {
  //     // detectFaces()
  //     runModel();
  //     // runMobilenetModel();
  //   }, 200);
  //   return() => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // const loadBlazefaceModel = async () => {
  //   setBlazefaceModel(await blazeface.load());
  // };

  // const detectFaces = async () => {
  //   const returnTensors = true;
  //   const predictions = await blazefaceModel?.estimateFaces(videoRef.current!, returnTensors).catch((err) => console.log("Log: Error while estimating face, Error: ", err));
  //   if (predictions!==undefined) {
  //     console.log("Log: Predictions: ", predictions![0])
  //   }
  // };
  
  // const loadVideoStream = () => {
  //   navigator.mediaDevices.getUserMedia({
  //     audio: false,
  //     video: true
  //   })
  //   .then((videoStream) => {
  //     videoRef.current!.srcObject = videoStream;
  //     console.log("Log: VideoStream obtained :)");
  //   })
  //   .catch((err) => {
  //     console.log("Log: Error while accessing VideoStream: ", err);
  //   });
  // };
  
  // const loadModels = async () => {
  //   const model = await tf.loadLayersModel("/converted_models/yolov2_tiny_face/model.json");
  //   if (model!==null) {
  //     console.log("Log: Model loaded: ", model);
  //     setModel(model)
  //   }
  // };
  
  // const loadMobilenetModel = async () => {
  //   const model = await tf.loadLayersModel("/converted_models/FaceExpression-MUL_KSIZE_MobileNet_v2_best/model.json");
  //   if (model !== null) {
  //     console.log("Log: Loaded MUL_KSIZE_MobileNet_v2_best model: ", model);
  //     setModel(model)
  //   }
  // };
  
  // const runModel = async () => {
  //   if (videoRef!==null && videoRef.current!==null && model!==null && blazefaceModel!==null) {
  //     const tensor = tf.browser.fromPixels(videoRef.current);
  //     const predictions = await blazefaceModel.estimateFaces(tensor, true);
  //     if (predictions !== undefined) {
  //       console.log("Log: Predictions: ", predictions);
  //       const reshapedTensor = tensor.reshape([1, 48, 48, 1]);
  //       const scale = {
  //         height: 480/tensor.shape[0],
  //         width: 640/tensor.shape[1]
  //       }
  //       const { topLeft, bottomRight } = predictions[0];
  //       const normalizedTopLeft = tf.div(topLeft, tensor.shape.slice(-3, 2));
  //       const normalizedBottomRight = tf.div(bottomRight, tensor.shape.slice(-3, 2));
  //       const width = Math.floor(bottomRight.dataSync()[0] - topLeft.dataSync()[0] * scale.width);
  //       const height = Math.floor(bottomRight.dataSync()[1] - topLeft.dataSync()[1] * scale.height);
  //       const boxes = tf.concat([normalizedTopLeft.dataSync(), normalizedBottomRight.dataSync()]).reshape([-1, 4]);
  //       const crop = tf.image.cropAndResize(
  //         reshapedTensor.dataSync(),
  //         boxes.dataSync(),
  //         [0],
  //         [height, width]
  //       );
  //       const grayScaleCrop = crop.mean(2).expandDims(2);
  //       const alignCorners = false;
  //       const resizedImage = tf.image.resizeBilinear(
  //         grayScaleCrop.dataSync(),
  //         [48, 48],
  //         alignCorners
  //       );
  //       const output = model.predict(resizedImage)
  //       console.log("Log: Output: ", output);
  //     }

  //     // {
  //     //   // const smallImg = tf.image.resizeBilinear(tfImg, [416, 416]);
  //     //   const smallImg = tfImg.resizeBilinear([416, 416]);
  //     //   const expanded = smallImg.expandDims(0);
  //     //   // const resized = tf.cast(smallImg, "float32");
  //     //   // const t4d = tf.tensor4d(Array.from(resized.dataSync()), [1, 416, 416, 3]);
  //     //   // model.predict(t4d, {batchSize: 64});
  //     //   const output = model.predict(expanded, {batchSize: 64, verbose: true});
  //     //   console.log("Log: Output: ", output)
  //     // }
  //   }
  // };
  
  // // const processOutput = (
  // //   output: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[],
  // //   frameWidth: number,
  // //   frameHeight: number
  // // ) => {
  // //   const anchors = [0.57273, 0.677385, 1.87446, 2.06253, 3.33843, 5.47434, 7.88282, 3.52778, 9.77052, 9.16828];
  // //   let netout = output;
  // //   const nb_class = 1;
  // //   const obj_threshold = 0.4;
  // //   const nms_threshold = 0.3;
  // //   const grid_h = netout.shape[0];
  // //   const grid_w = netout.shape[1];
  // //   let nb_box = netout.shape[2];
    
  // //   const size = 4 + nb_class + 1;
  // //   nb_box = 5;
    
  // //   netout = netout.reshape(grid_h,grid_w,nb_box,size)
    
  // //   const boxes = [];
    
  // //   // decode the output by the network
  // //   // netout[..., 4]  = _sigmoid(netout[..., 4])
  // //   // netout[..., 5:] = netout[..., 4][..., np.newaxis] * _softmax(netout[..., 5:])
  // //   // netout[..., 5:] *= netout[..., 5:] > obj_threshold
  // // };
  
  // const runMobilenetModel = () => {
  //   if (videoRef!==null && videoRef.current!==null && videoRef.current!==undefined && model!==null) {
  //     const tfImg = tf.browser.fromPixels(videoRef.current);
  //     const smallImg = tfImg.resizeBilinear([48, 48]);
  //     const resized = tf.cast(smallImg, "float32");
  //     // const expanded = smallImg.expandDims(0);
  //     const t4d = tf.tensor4d(Array.from(resized.dataSync()), [1, 48, 48, 1]);
  //     const output = model.predict(t4d);
  //     console.log("Log: Output: ", output)
  //   }
  // };

  return (
    <div className="App">
      <header className="App-header">
        <MiniXception />
        {/* <TinyXception /> */}
      </header>
    </div>
  )
};

export default App;
