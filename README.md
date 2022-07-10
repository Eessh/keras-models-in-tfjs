<h1 align="center">
    <img src="./src/favicon.svg" valign="middle" width="180" height="180" alt="logo" />
    <a href="https://keras-models-in-tfjs.netlify.app">
        <span valign="middle">
                Keras models in TensorflowJS
        </span>
    </a>
</h1>

![Working Demo](./screenshots/demo.jpeg)

This web app uses a model made in python(using [Keras](https://keras.io/)), in the browser with [TensorflowJS](https://tensorflow.org/js/).
The model is converted from Keras(.h5 or .hdf5) to TensorflowJS compatible with the help of this tool: [TensorflowJS Converter](https://www.tensorflow.org/js/tutorials/conversion/import_keras).

Keras model is taken from this [repo](https://github.com/liminze/Real-time-Facial-Expression-Recognition-and-Fast-Face-Detection/tree/master/models/best_model).
Converted model is [here](https://github.com/Eessh/keras-models-in-tfjs/tree/master/public/converted_models/FaceExpression-MUL_KSIZE_MobileNet_v2_best).

## Data Flow

```mermaid
flowchart TD
  A[Load Video] --> B[Load Blazeface, TensorflowJS model, for face detection];
  B --> C[Load MobileNetV2, for face expression classification];
  C --> D[Detect face, return bounding rectangle]
  D --> | Bounding Rectangle | E[Draw face detection on canvas, using the bounding rectangle]
  E --> F[Extract face tensor from video, using the bounding rectangle, return face tensor]
  F --> | Face Tensor | G[Convert the face tensor to grayscaled, as the model is trained on grayscaled images, return grayscaled face tensor]
  G --> | Grayscaled Face Tensor | H[Resize the grayscaled face tensor to 48x48, as the model is trained on images with dimensions 48x48, return resized face tensor]
  H --> | Resized Face Tensor | I[Feed the resized face tensor to model, update the prediction in the GlobalContext]
  I --> J[Dispose all tensors, which prevents from Heavy Memory Leaks, Tab Freezing, ...]
  J --> K[EmotionEmoji: Takes the prediction in GlobalContext, renders corresponding emoji.]
```

## To run on local server
```bash
git clone https://github.com/Eessh/keras-models-in-tfjs.git
cd keras-models-in-tfjs/
npm install
npm run dev
```
