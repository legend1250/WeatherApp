import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button } from 'antd';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      fetching: true,
      location_request: null,
      address: null,
      current_temp: 0,
      next_weather_list: [],
    };
  }

  componentDidMount() {
    fetch('/api')
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        this.setState({
          message: json.message,
          fetching: false
        });
      }).catch(e => {
        this.setState({
          message: `API call failed: ${e}`,
          fetching: false
        });
      })
  }

  handleClick = (e) => {
    e.preventDefault();
    console.log(this.state.location_request);
    fetch(`/weather?location=${this.state.location_request}`,{
      method: 'GET',
    })
      .then(res => res.json())
      .then(json => {
        this.setState({
          address: json.address,
          current_temp: json.temp,
          next_weather_list: json.nextWeather,
        }, () => {
          console.log(this.state.next_weather_list);
          console.log(this.state.address);
          console.log(this.state.current_temp);
          
        })
      })
      .catch(e => console.log(e));
  }

  handleChangeInput = (e) => {
    this.setState({
      location_request: e.target.value
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        

        
        <form onSubmit={this.handleClick}>
            
            <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" placeholder="ZIP Code; City; Province; Address..." onChange={this.handleChangeInput} />
            </div>
        
            <Button icon="search">Submit</Button>
            
        </form>
        
      </div>
    );
  }
}

export default App;
