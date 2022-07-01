import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

const MiniXception = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {loadMiniXception();}, []);
  useEffect(() => {loadVideoStream()}, []);

  const loadMiniXception = async () => {
    const model = await tf.loadLayersModel("/converted_models/MINI_XCEPTION/model.json");
    setModel(model);
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