import Logo from "../../assets/images";
import { Github } from "../../assets/icons";
import "./HeaderBar.css";

const HeaderBar = () => {

  return (
    <div className="HeaderBar">
      <a target="_blank" rel="noopener noreferrer" href="https://www.imbesideyou.com/english"><img className="logo" src={Logo} /></a>
      <span className="description">
        <span className="desc--text">Keras models in TensorflowJS</span>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Eessh/keras-models-in-tfjs" className="desc--icon"><Github /></a>
      </span>
    </div>
  );

};

export default HeaderBar;