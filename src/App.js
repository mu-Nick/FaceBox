import React, {Component} from 'react';
import './App.css';

import 'tachyons';
import Particles from 'react-particles-js';

import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';


const particlesProperties = {
"particles": {
    "number": {
        "value": 100
    },
    "size": {
        "value": 3
    }
},
"interactivity": {
    "events": {
        "onhover": {
            "enable": true,
            "mode": "repulse"
        }
    }
}
};


const initialState = {
  input: '',
  imageURL: '',
  box: {}, 
  route: 'SignIn',
  isSignedIn: false, 
  user: {
    id: '', 
    name: '', 
    email: '',  
    entries: 0, 
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    // console.log(data);
    this.setState({ user: {
        id: data.id, 
        name: data.name, 
        email: data.email,  
        entries: data.entries, 
        joined: data.joined
      }
    })
    // console.log(this.state);
  }

  calculateFaceLocation = (data) => {
    const clarifyFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifyFace.left_col * width, 
      topRow: clarifyFace.top_row * height, 
      rightCol: width - (clarifyFace.right_col * width), 
      bottomRow: height - (clarifyFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    // console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageURL: this.state.input});
    fetch('http://localhost:3000/imageUrl', {
        method: 'post', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then( response => {
        if(response) {
          fetch('http://localhost:3000/image', {
            method: 'put', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'SignIn' || route === 'register')
      this.setState(initialState);
    else if (route === 'home')
      this.setState({isSignedIn: true});
    this.setState({ route: route });
  }

  getEntries = () => {
    return this.state.user.entries;
  }

  render() {
    const { isSignedIn, imageURL, route, box } = this.state;
    return(
      <div className="App">
        <Particles className='particles'
          params={particlesProperties} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { this.state.route === 'home' 
          ? <div>
              <Logo />
              <Rank 
                name = {this.state.user.name}  
                entries = {this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
               />
              <FaceRecognition box={box} imageURL={imageURL}/>
            </div>
          : (
               route === 'SignIn'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
          }
      </div>
      );
    }
  };

export default App;
