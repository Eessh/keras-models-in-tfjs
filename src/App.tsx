import { GlobalContextProvider } from "./GlobalContext";
import MobileNetV2 from "./components/MobileNetV2";
import EmotionEmoji from "./components/EmotionEmoji";
import './App.css';
import HeaderBar from "./components/HeaderBar";

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <GlobalContextProvider>
          <HeaderBar />
          <div className="content">
            <div className="left">
              <MobileNetV2 />
            </div>
            <div className="right">
              <EmotionEmoji />
            </div>
          </div>
        </GlobalContextProvider>
      </header>
    </div>
  )
};

export default App;
