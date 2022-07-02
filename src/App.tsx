import { GlobalContextProvider } from "./GlobalContext";
import RealtimeEmotionChart from "./components/RealtimeEmotionChart";
import MobileNetV2 from "./components/MobileNetV2";
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
            <RealtimeEmotionChart />
          </div>
        </GlobalContextProvider>
      </header>
    </div>
  )
};

export default App;
