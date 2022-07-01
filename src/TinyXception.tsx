import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

const TinyXception = () => {
  const [blazefaceModel, setBlazefaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    loadBlazeface();
    loadTinyXception();
  }, []);
  useEffect(() => {loadVideoStream()}, []);
  useEffect(() => {
    const interval = setInterval(() => {doIt()}, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadBlazeface = async () => {
    const model = await blazeface.load();
    if (model !== null) {
      setBlazefaceModel(model);
      console.log("Log: Loaded Blazeface model.");
    }
  };

  const loadTinyXception = async () => {
    const model = await tf.loadLayersModel("/converted_models/FaceExpression-MUL_KSIZE_MobileNet_v2_best/model.json");
    if (model !== null) {
      setModel(model);
      console.log("Log: Loaded TinyXception model.");
    }
  }

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

  const prepareTensor = (videoFrame: HTMLVideoElement, size: number) => {
    // Convert to tensor
    const tensor = tf.browser.fromPixels(videoFrame);
    // Normalize from [0, 255] to [-1, 1]
    const NORMALIZATION_OFFSET = tf.scalar(127.5)
    const normalizedTensor = tensor.toFloat().sub(NORMALIZATION_OFFSET).div(NORMALIZATION_OFFSET);
    if (tensor.shape[0]===size && tensor.shape[1]===size) {
      return normalizedTensor;
    }
    // Resize image to proper dimensions
    const alignCorners = true;
    return tf.image.resizeBilinear(normalizedTensor.dataSync(), [size, size], alignCorners).as4D();
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

  const getMaxEmotion = (arr: number[]): string => {
    const emotions = ["angry" ,"disgust","scared", "happy", "sad", "surprised", "neutral"];
    let maxValue = Number.NEGATIVE_INFINITY, index = 0;
    for (let i = 0; i < 7; i++) {
      if (arr[i] > maxValue) {
        index = i;
        maxValue = arr[i];
      }
    }
    return emotions[index];
  };

  const doIt = async () => {
    if (videoRef!==null && videoRef.current!==null && blazefaceModel!==null && model!==null) {
      const returnTensors = false;
      const facePredictions = await blazefaceModel.estimateFaces(videoRef.current);
      if (facePredictions!==undefined) {
        // console.log("Log: Face predictions: ", facePredictions[0]);
        const { topLeft, bottomRight } = facePredictions[0];
        const boundingRect: Rect = {
          x: topLeft[1],
          y: topLeft[0],
          width: bottomRight[0] - topLeft[0],
          height: bottomRight[1] - topLeft[1]
        };
        // console.log("Log: BoundingRect: ", boundingRect);
        const tensor = tf.browser.fromPixels(videoRef.current);
        const facetensor = await extractFaceTensor(tensor, boundingRect);
        const grayscaled = await rgbToGrayscale(facetensor);

        // const resized = facetensor.resizeBilinear([48, 48], true).expandDims(0);
        const resized = grayscaled.resizeBilinear([48, 48]).mean(2).toFloat().expandDims(0).expandDims(-1);
        // console.log("Log: ResizedFaceTensor: ", resized);
        const output = model.predict(resized);
        console.log("Log: Emotion: ", getMaxEmotion(await output.arraySync()[0]));
        
        // const tensor = tf.browser.fromPixels(videoRef.current);
        // const { topLeft, bottomRight } = facePredictions[0];
        // const normTopLeft = tf.div(topLeft, tensor.shape.slice(-3, -2));
        // const normBottomLeft = tf.div(bottomRight, tensor.shape.slice(-3, -2));
        // const scale = {
        //   height: 480/tensor.shape[0],
        //   width: 640/tensor.shape[1]
        // };
        // const width = Math.floor(bottomRight.dataSync()[0] - topLeft.dataSync()[0]*scale.width);
        // const height = Math.floor(bottomRight.dataSync()[1] - topLeft.dataSync()[1]*scale.height);
        // const boxes = tf.concat([normTopLeft.dataSync(), normBottomLeft.dataSync()]).reshape([-1, 4]);
        // const crop = tf.image.cropAndResize(
        //   tensor.reshape([1, 64, 64, 1]).dataSync(),
        //   boxes.dataSync(),
        //   [0],
        //   [height, width]
        // );
        
        // const output = model.predict(crop)
        // console.log("Log: Output: ", output)
      }
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

export default TinyXception;