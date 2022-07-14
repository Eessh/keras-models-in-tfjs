import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useGlobalContext } from "../../GlobalContext";
import { FaceDetection, FaceLandmarks68, WithFaceExpressions, WithFaceLandmarks } from "face-api.js";
import "./FaceAPI.css";

const FaceAPI = () => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    faceapiModelsLoaded,
    setFaceapiModelsLoaded,
    setVideoLoaded,
    setFaceapiEmotion
  } = useGlobalContext();

  useEffect(() => {
    loadVideo();
    loadFaceapiModels();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {processVideoStream()}, 200);
    return () => clearInterval(interval);
  }, []);

  const loadVideo = () => {
    navigator.mediaDevices.getUserMedia({audio: false, video: true})
    .then((videoStream) => {
      if (videoRef!==null && videoRef.current!==null && videoRef.current!==undefined) {
        videoRef.current.srcObject = videoStream;
        console.log("Log: Loaded VideoStream.");
      }
    })
    .catch((err) => {console.log("Log: Error while getting video stream: ", err)});
  };

  const loadFaceapiModels = () => {
    const ModelsURL = "/faceapi_models";
    Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri(ModelsURL),
      faceapi.nets.faceRecognitionNet.loadFromUri(ModelsURL),
      faceapi.nets.faceLandmark68Net.loadFromUri(ModelsURL),
      faceapi.nets.tinyFaceDetector.loadFromUri(ModelsURL)
    ])
      .then(() => {
        setFaceapiModelsLoaded(true);
        console.log("Log: Loaded Faceapi models.");
      })
      .catch((err) => console.log("Log: Error while loading Faceapi models: ", err));
  };

  const processVideoStream = async () => {
    if (videoRef===null || videoRef.current===null || videoRef.current===undefined) {
      console.log("Log: returning...");
      return;
    }
    detectFaces(videoRef.current)
    .then(async (info) => {
      if (info === null) {
        return;
      }
      else if (info.length > 0) {
        // drawing face detection to canvas
        if (canvasRef && canvasRef.current) {
          const context = canvasRef.current.getContext("2d");
          if (context) {
            context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            context.strokeStyle="aqua";
            context.strokeRect(
              info[0].detection.box.x,
              info[0].detection.box.y,
              info[0].detection.box.width,
              info[0].detection.box.height
            );
          }
        }
        // setting emotion predictions in GlobalContext
        const sortedEmotions = info[0].expressions.asSortedArray();
        console.log("Log: Sorted emotions: ", sortedEmotions)
        setFaceapiEmotion(sortedEmotions[0].expression);
      }
    })
  };

  const detectFaces = async (image: HTMLVideoElement): Promise<WithFaceExpressions<WithFaceLandmarks<{detection: FaceDetection;}, FaceLandmarks68>>[] | null> => {
    const imgSize = image.getBoundingClientRect();
    const displaySize = {
      width: imgSize.width,
      height: imgSize.height
    };
    if (displaySize.height <= 0) {
      return null;
    }
    const faces = await faceapi
                          .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({inputSize: 320}))
                          .withFaceLandmarks()
                          .withFaceExpressions()
    return faceapi.resizeResults(faces, displaySize);
  };

  return (
    <div className="FaceAPI">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
      ></canvas>
      <video
        ref={videoRef}
        width={640}
        height={480}
        onLoadedData={() => {
          setVideoLoaded(true);
          console.log("Log: Video loaded.");
        }}
        autoPlay
        muted
        playsInline
      ></video>
    </div>
  );

};

export default FaceAPI;