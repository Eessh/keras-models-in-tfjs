import { useGlobalContext } from "../../GlobalContext";
import { getEmojiForPrediction, getEmojiForFaceapiPrediction } from "../../utils";
import "./EmotionEmoji.css";

const EmotionEmoji = () => {

  const {
    blazefaceLoaded,
    mobileNetV2Loaded,
    faceapiModelsLoaded,
    videoLoaded,
    prediction,
    faceapiEmotion,
  } = useGlobalContext();

  return (
    blazefaceLoaded && mobileNetV2Loaded && videoLoaded
    ? <p className="EmotionEmoji">
        {getEmojiForPrediction(prediction)}
      </p>
    : <>Loading Models ...</>
    // faceapiModelsLoaded && videoLoaded
    // ? <p className="EmotionEmoji">
    //     {getEmojiForFaceapiPrediction(faceapiEmotion)}
    //   </p>
    // : <>Loading Models ...</>
  );

};

export default EmotionEmoji;