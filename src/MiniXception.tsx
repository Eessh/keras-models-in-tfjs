import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

const MiniXception = () => {
  const [blazefaceModel, setBlazefaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [miniXceptionModel, setMiniXceptionModel] = useState<tf.LayersModel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {loadVideoStream()}, []);
  useEffect(() => {
    loadBlazeface();
    loadMiniXception();

    const interval = setInterval(() => {makePredictions()}, 200);
    return () => clearInterval(interval);
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
      console.log("Log: Error while accessing VideoStream: ", err)
    });
  };

  const loadBlazeface = async () => {
    const model = await blazeface.load();
    if (model!==undefined) {
      setBlazefaceModel(model);
      console.log("Log: Blazeface model loaded");
    }
  };

  const loadMiniXception = async () => {
    const model = await tf.loadLayersModel("/converted_models/MINI_XCEPTION/model.json");
    if (model !== undefined) {
      setMiniXceptionModel(model);
      console.log("Log: MiniXception model loaded");
    }
  }

  type Rect = {
    x: number,
    y: number,
    width: number,
    height: number
  };

  const floorRect = (rect: Rect): Rect => {
    return {
      x: Math.floor(rect.x),
      y: Math.floor(rect.y),
      width: Math.floor(rect.width),
      height: Math.floor(rect.height),
    };
  };

  function isTensor(tensor: any, dim: number) {
    return tensor instanceof tf.Tensor && tensor.shape.length === dim
  }

  function isTensor1D(tensor: any): tensor is tf.Tensor3D {
    return isTensor(tensor, 1)
  }

  function isTensor3D(tensor: any): tensor is tf.Tensor3D {
    return isTensor(tensor, 3)
  }

  function isTensor4D(tensor: any): tensor is tf.Tensor4D {
    return isTensor(tensor, 4)
  }

  const extractFaceTensor = async (imageTensor: tf.Tensor3D | tf.Tensor4D, detection: Rect): Promise<tf.Tensor3D> => {
    if (!isTensor3D(imageTensor) && !isTensor4D(imageTensor)) {
      throw new Error('extractFaceTensors - expected image tensor to be 3D or 4D')
    }
  
    if (isTensor4D(imageTensor) && imageTensor.shape[0] > 1) {
      throw new Error('extractFaceTensors - batchSize > 1 not supported')
    }
  
    return tf.tidy(() => {
      const [imgHeight, imgWidth, numChannels] = imageTensor.shape.slice(isTensor4D(imageTensor) ? 1 : 0);
      const {x, y, width, height} = floorRect(detection);
      const faceTensor = tf.slice3d(imageTensor.as3D(imgHeight, imgWidth, numChannels), [y, x, 0], [height, width, numChannels])
  
      return faceTensor;
    })
  };

  const rgbToGrayscale = async (imgTensor: tf.Tensor<tf.Rank>) => {
    const minTensor = imgTensor.min()
    const maxTensor = imgTensor.max()
    const min = (await minTensor.data())[0]
    const max = (await maxTensor.data())[0]
    minTensor.dispose()
    maxTensor.dispose()
  
    // Normalize to [0, 1]
    const normalized = imgTensor.sub(tf.scalar(min)).div(tf.scalar(max - min))
  
    // Compute mean of R, G, and B values
    let grayscale = normalized.mean(2)
  
    // Expand dimensions to get proper shape: (h, w, 1)
    return grayscale.expandDims(2)
  }

  const makePredictions = async () => {
    if (videoRef===null || videoRef.current===null || blazefaceModel===null || miniXceptionModel===null) {
      console.log("Log: Predicted Emotion: Neutral");
      return;
    }
    const imageTensor = tf.browser.fromPixels(videoRef.current);
    const returnTensors = false;
    const facePrediction = (await blazefaceModel.estimateFaces(imageTensor, returnTensors))[0];
    const { topLeft, bottomRight } = facePrediction;
    if (!isTensor1D(topLeft) && !isTensor1D(bottomRight)) {
      const boundingRect: Rect = {
        x: topLeft[1],
        y: topLeft[0],
        width: bottomRight[0] - topLeft[0],
        height: bottomRight[1] - topLeft[1]
      };
      const faceTensor = await extractFaceTensor(imageTensor, boundingRect);
      const grayscaledFaceTensor = await rgbToGrayscale(faceTensor);
      const resizedFaceTensor = faceTensor.resizeBilinear([64, 64]).mean(2).toFloat().expandDims(0).expandDims(-1);
      const output = miniXceptionModel.predict(resizedFaceTensor);
      console.log("Log: Predicted Emotion: ", await output.arraySync()[0]);
    }
  };

  return (
    <video
      ref={videoRef}
      width={640}
      height={720}
      autoPlay
      muted
      playsInline
    ></video>
  );
};

export default MiniXception;