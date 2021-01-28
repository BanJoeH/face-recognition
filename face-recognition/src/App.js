import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn.js';
import Registration from './components/Registration/Registration.js';

const app = new Clarifai.App({
  apiKey: 'eb58449b870a4b96acc0ed2d956ae7ca'
 });

const particlesOptions = {
  particles: {
      number: {
        value: 81,
        density: {
          enable: true,
          value_area: 800,
        }
      }
    }
  }

class App extends Component {
  constructor() {
    super();
    this.state= {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
    }
  }

  calcFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange= (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl : this.state.input})
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => this.displayFaceBox(this.calcFaceLocation(response)))
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    }else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render () {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App vh-100">
      <Particles 
        className ='particles'
        params={particlesOptions} 
        />  
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route ==='home' 
          ? <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit} 
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
          : (
            this.state.route === 'signin' 
            ? <SignIn onRouteChange={this.onRouteChange} />
            : <Registration onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
}

export default App;
