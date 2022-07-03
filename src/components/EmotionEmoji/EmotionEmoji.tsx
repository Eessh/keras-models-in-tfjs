import { useGlobalContext } from "../../GlobalContext";
import { getEmojiForPrediction } from "../../utils";
import "./EmotionEmoji.css";

const EmotionEmoji = () => {

  const {
    blazefaceLoaded,
    mobileNetV2Loaded,
    videoLoaded,
    prediction
  } = useGlobalContext();

  return (
    blazefaceLoaded && mobileNetV2Loaded && videoLoaded
    ? <p className="EmotionEmoji">
        {getEmojiForPrediction(prediction)}
      </p>
    : <>Loading Models ...</>
  );

};

export default EmotionEmoji;