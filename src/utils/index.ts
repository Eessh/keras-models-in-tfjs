import * as tf from "@tensorflow/tfjs";
import { TPrediction } from "../GlobalContext";

export type Rect = {
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
  return tensor instanceof tf.Tensor && tensor.shape.length === dim;
}

function isTensor1D(tensor: any): tensor is tf.Tensor1D {
  return isTensor(tensor, 1);
}

function isTensor3D(tensor: any): tensor is tf.Tensor3D {
  return isTensor(tensor, 3);
}

function isTensor4D(tensor: any): tensor is tf.Tensor4D {
  return isTensor(tensor, 4);
}

const extractFaceTensor = async (imageTensor: tf.Tensor3D | tf.Tensor4D, detection: Rect): Promise<tf.Tensor3D> => {
  if (!isTensor3D(imageTensor) && !isTensor4D(imageTensor)) {
    throw new Error('extractFaceTensors - expected image tensor to be 3D or 4D');
  }

  if (isTensor4D(imageTensor) && imageTensor.shape[0] > 1) {
    throw new Error('extractFaceTensors - batchSize > 1 not supported');
  }

  return tf.tidy(() => {
    const [imgHeight, imgWidth, numChannels] = imageTensor.shape.slice(isTensor4D(imageTensor) ? 1 : 0);
    const {x, y, width, height} = floorRect(detection);
    const faceTensor = tf.slice3d(imageTensor.as3D(imgHeight, imgWidth, numChannels), [y, x, 0], [height, width, numChannels])

    return faceTensor;
  })
};

const rgbToGrayscale = async (imgTensor: tf.Tensor<tf.Rank>) => {
  const minTensor = imgTensor.min();
  const maxTensor = imgTensor.max();
  const min = (await minTensor.data())[0];
  const max = (await maxTensor.data())[0];
  minTensor.dispose();
  maxTensor.dispose();

  return tf.tidy(() => {
    // Normalize to [0, 1]
    const normalized = imgTensor.sub(tf.scalar(min)).div(tf.scalar(max - min));

    // Compute mean of R, G, and B values
    let grayscale = normalized.mean(2);

    // Expand dimensions to get proper shape: (h, w, 1)
    return grayscale.expandDims(2);
  });
};

const Emotions = ["Angry", "Disgust", "Scared", "Happy", "Sad", "Surprised", "Neutral"];

const getMaxEmotion = (arr: number[]): string => {
  let maxValue = Number.NEGATIVE_INFINITY, index = 0;
  for (let i = 0; i < 7; i++) {
    if (arr[i] > maxValue) {
      index = i;
      maxValue = arr[i];
    }
  }
  return Emotions[index];
};

const EmojiMap = new Map<string, string>([
  ["Angry", "😠"],
  ["Disgust", "🤮"],
  ["Scared", "😬"],
  ["Happy", "😄"],
  ["Sad", "😥"],
  ["Surprised", "😧"],
  ["Neutral", "😐"],
]);

const getEmojiForPrediction = (prediction: TPrediction): string => {
  return EmojiMap.get(getMaxEmotion(prediction))!;
};

const capitalize = (input: string): string => {
  return input[0].toUpperCase() + input.slice(1);
};

const getEmojiForFaceapiPrediction = (emotion: string): string => {
  return EmojiMap.get(capitalize(emotion))!;
};

export {
  floorRect,
  isTensor,
  isTensor1D,
  isTensor3D,
  isTensor4D,
  extractFaceTensor,
  rgbToGrayscale,
  Emotions,
  getMaxEmotion,
  getEmojiForPrediction,
  getEmojiForFaceapiPrediction
};