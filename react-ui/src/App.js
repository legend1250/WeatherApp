import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';
import { Form, Icon, Input, Button } from 'antd';
const FormItem = Form.Item;

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
      next_weather_list: [],
    };
  }

  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
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

  handleChangeInput = (e) => {
    this.setState({
      location_request: e.target.value
    })
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    // Only show error after a field is touched.
    const userNameError = isFieldTouched('userName') && getFieldError('userName');
    const passwordError = isFieldTouched('password') && getFieldError('password');
    return (
        <div>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <FormItem
              validateStatus={userNameError ? 'error' : ''}
              help={userNameError || ''}
            >
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input prefix={<Icon type="place" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
              )}
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
              >
                Log in
              </Button>
            </FormItem>
          </Form>
          
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

const WrappedApp = Form.create()(App);

export default WrappedApp;
