import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { useGlobalContext } from "../../GlobalContext";
import {
  isTensor1D,
  extractFaceTensor,
  rgbToGrayscale,
  getMaxEmotion,
  Rect
} from "../../utils";
import "./MobileNetV2.css";

const MobileNetV2 = () => {
  let blazefaceModel: blazeface.BlazeFaceModel | null = null;
  let mobileNetV2Model: tf.LayersModel | null = null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    setBlazefaceLoaded,
    setMobileNetV2Loaded,
    setVideoLoaded,
    setPrediction
  } = useGlobalContext();

  useEffect(() => {
    const interval = setInterval(() => {makePredictions()}, 200);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    loadBlazeface();
    loadMobileNetV2();

    return () => {
      mobileNetV2Model?.layers.forEach(layer => layer.dispose());
    };
  }, []);
  useEffect(() => {loadVideoStream()}, []);

  const loadBlazeface = async () => {
    blazeface.load().then((model) => {
      blazefaceModel = model;
      setBlazefaceLoaded(true);
      console.log("Log: Blazeface model loaded");
    });
  };

  const loadMobileNetV2 = async () => {
    tf.loadLayersModel("/converted_models/FaceExpression-MUL_KSIZE_MobileNet_v2_best/model.json").then((model) => {
      mobileNetV2Model = model;
      setMobileNetV2Loaded(true);
      console.log("Log: MobileNetV2 model loaded");
    });
  };

  const loadVideoStream = () => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then((videoStream) => {
      videoRef.current!.srcObject = videoStream;
      setVideoLoaded(true);
      console.log("Log: VideoStream obtained :)");
    })
    .catch((err) => {
      console.log("Log: Error while accessing VideoStream: ", err);
    });
  };

  const drawPredictions = (boundingRect: Rect) => {
    if (canvasRef === null) {
      return;
    }
    const context = canvasRef.current?.getContext("2d");
    if (context===undefined || context===null) {
      return;
    }
    context.clearRect(0, 0, 640, 480);
    const { x, y, width, height } = boundingRect;
    context.strokeStyle = "aqua";
    context.strokeRect(x, y, width, height);
  };

  const makePredictions = async () => {
    if (videoRef===null || videoRef.current===null || blazefaceModel===null || mobileNetV2Model===null) {
      console.log("Log: Predicted Emotion: Neutral");
      return;
    }
    const imageTensor = tf.browser.fromPixels(videoRef.current);
    const returnTensors = false;
    const facePrediction = (await blazefaceModel.estimateFaces(imageTensor, returnTensors))[0];
    if (facePrediction === undefined) {
      return;
    }
    const { topLeft, bottomRight } = facePrediction;
    if (!isTensor1D(topLeft) && !isTensor1D(bottomRight)) {
      const boundingRect: Rect = {
        x: topLeft[0],
        y: topLeft[1],
        width: bottomRight[0] - topLeft[0],
        height: bottomRight[1] - topLeft[1]
      };
      drawPredictions(boundingRect);
      const faceTensor = await extractFaceTensor(imageTensor, boundingRect);
      const grayscaledFaceTensor = await rgbToGrayscale(faceTensor);
      const resizedFaceTensor = grayscaledFaceTensor.resizeBilinear([48, 48]).mean(2).toFloat().expandDims(0).expandDims(-1);
      const output = mobileNetV2Model.predict(resizedFaceTensor);
      setPrediction(output.arraySync()[0]);
      console.log("Log: Predicted Emotion: ", getMaxEmotion(await output.arraySync()[0]));
    }
  };

  return (
    <div className="MobilneNetV2">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
      ></canvas>
      <video
        ref={videoRef}
        width={640}
        height={480}
        autoPlay
        muted
        playsInline
      ></video>
    </div>
  );
};

export default MobileNetV2;



// const doIt = async () => {
  //   if (videoRef!==null && videoRef.current!==null && blazefaceModel!==null && model!==null) {
  //     const returnTensors = false;
  //     const facePredictions = await blazefaceModel.estimateFaces(videoRef.current);
  //     if (facePredictions!==undefined) {
  //       // console.log("Log: Face predictions: ", facePredictions[0]);
  //       const { topLeft, bottomRight } = facePredictions[0];
  //       const boundingRect: Rect = {
  //         x: topLeft[1],
  //         y: topLeft[0],
  //         width: bottomRight[0] - topLeft[0],
  //         height: bottomRight[1] - topLeft[1]
  //       };
  //       // console.log("Log: BoundingRect: ", boundingRect);
  //       const tensor = tf.browser.fromPixels(videoRef.current);
  //       const facetensor = await extractFaceTensor(tensor, boundingRect);
  //       const grayscaled = await rgbToGrayscale(facetensor);

  //       // const resized = facetensor.resizeBilinear([48, 48], true).expandDims(0);
  //       const resized = grayscaled.resizeBilinear([48, 48]).mean(2).toFloat().expandDims(0).expandDims(-1);
  //       // console.log("Log: ResizedFaceTensor: ", resized);
  //       const output = model.predict(resized);
  //       console.log("Log: Emotion: ", getMaxEmotion(await output.arraySync()[0]))
        
  //       // const tensor = tf.browser.fromPixels(videoRef.current);
  //       // const { topLeft, bottomRight } = facePredictions[0];
  //       // const normTopLeft = tf.div(topLeft, tensor.shape.slice(-3, -2));
  //       // const normBottomLeft = tf.div(bottomRight, tensor.shape.slice(-3, -2));
  //       // const scale = {
  //       //   height: 480/tensor.shape[0],
  //       //   width: 640/tensor.shape[1]
  //       // };
  //       // const width = Math.floor(bottomRight.dataSync()[0] - topLeft.dataSync()[0]*scale.width);
  //       // const height = Math.floor(bottomRight.dataSync()[1] - topLeft.dataSync()[1]*scale.height);
  //       // const boxes = tf.concat([normTopLeft.dataSync(), normBottomLeft.dataSync()]).reshape([-1, 4]);
  //       // const crop = tf.image.cropAndResize(
  //       //   tensor.reshape([1, 64, 64, 1]).dataSync(),
  //       //   boxes.dataSync(),
  //       //   [0],
  //       //   [height, width]
  //       // );
        
  //       // const output = model.predict(crop)
  //       // console.log("Log: Output: ", output)
  //     }
  //   }
  // };
