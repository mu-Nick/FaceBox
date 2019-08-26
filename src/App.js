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
      "value": 40,
      "density": {
        "enable": true,
        "value_area": 1000
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 50,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 300,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 2
    },
    "move": {
      "enable": true,
      "speed": 12,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 800,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 800,
        "size": 80,
        "duration": 2,
        "opacity": 0.8,
        "speed": 3
      },
      "repulse": {
        "distance": 400,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
}


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
    if(!this.state.input) {
      return alert("Please enter a valid image URL");
    }
    fetch('https://face-boxx.herokuapp.com/imageUrl', {
        method: 'post', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
    .then(response => response.json())
    .then( response => {
      if(response !== "unable to work with API") {
        fetch('https://face-boxx.herokuapp.com/image', {
          method: 'put', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          if(count !== "unable to get entries")
            this.setState(Object.assign(this.state.user, { entries: count }))
        })

        this.displayFaceBox(this.calculateFaceLocation(response))
      }

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
