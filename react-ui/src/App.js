import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';
import { Form, Icon, Input, Button, Table } from 'antd';
const FormItem = Form.Item;
// import Skycons from './dist/ReactSkycons'

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location_request: null,
      address: null,
      current_temp: 0,
      next_weather_list: null,
    };
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      if (!err) {
        
        fetch(`/weather?location=${values.location}`,{
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
            })
          })
          .catch(e => console.log(e));
      }
    });
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
        })
      })
      .catch(e => console.log(e));
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    // Only show error after a field is touched.
    const locationError = isFieldTouched('location') && getFieldError('location');
    const btn_style = {
      textAlign: 'center',
      border: '2px solid #4286f4'
    }
    const columns = [{
      title: 'Time Approximately',
      dataIndex: 'time',
    }, {
      title: 'Temperature (feels like)',
      dataIndex: 'apparentTemperature',
    },{
      title: 'Description',
      dataIndex: 'summary',
    },{
      title: 'Icon',
      dataIndex: 'icon',
    }]
    const data = this.state.next_weather_list && this.state.next_weather_list.map( (wh, index) => {
      return({
        key: index,
        ...wh,
        time: new Date(Number(wh.time*1000)).toLocaleString(),
      })
    });
    return (
        <div>
          <h1>Weather App</h1>
          <div className="form-location">
          <Form onSubmit={this.handleSubmit}>
            <label>Location</label>
            <FormItem 
              validateStatus={locationError ? 'error' : ''}
              help={locationError || ''}
            >
              {getFieldDecorator('location', {
                rules: [{ required: true, message: 'Please pick up a location!' }],
              })(
                <Input size="large" prefix={<Icon type="environment-o" />} placeholder="ZIP Code; City; Province; Address..." />
              )}
            </FormItem>
            <FormItem style={{textAlign: "center"}}>
              <Button
                type="primary"
                htmlType="submit"
                icon="search"
                size="large"
                style={btn_style}
                disabled={hasErrors(getFieldsError())}
              >
                Search
              </Button>
            </FormItem>
            {this.state.address ? <FormItem className="text-result">{this.state.address}</FormItem> : null}
            {this.state.current_temp ? <FormItem>Current temp (feels like): {this.state.current_temp}</FormItem> : null}
          </Form>
          </div>
          {/* <form onSubmit={this.handleClick}>
              
              <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-control" placeholder="ZIP Code; City; Province; Address..." onChange={this.handleChangeInput} />
              </div>
          </form> */}
          <div>
            
            {this.state.next_weather_list ? <Table className="weather-table" columns={columns} dataSource={data} size="middle" bordered /> : null}
          </div>
          <div>
          {/* <Skycons color='white' icon='WIND' /> */}
          </div>
        </div>
      );
  }
}

const WrappedApp = Form.create()(App);

export default WrappedApp;
