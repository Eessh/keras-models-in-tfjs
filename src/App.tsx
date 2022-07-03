import { GlobalContextProvider } from "./GlobalContext";
import MobileNetV2 from "./components/MobileNetV2";
import EmotionEmoji from "./components/EmotionEmoji";
import './App.css';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <GlobalContextProvider>
          <div className="left">
            <MobileNetV2 />
          </div>
          <div className="right">
            <EmotionEmoji />
          </div>
        </GlobalContextProvider>
      </header>
    </div>
  )
};

export default App;
