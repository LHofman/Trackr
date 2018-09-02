import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';

import fetch from '../../utils/fetch';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      usernameError: '',
      password: '',
      passwordError: '',
      loginError: '',
      redirect: undefined
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  login(user) {
    return fetch(`/users/authenticate`, 'post', false, user).then(body => {
      if (body.success) {
        localStorage.setItem('auth_token', body.token);
        localStorage.setItem('user', JSON.stringify(body.user));
        this.setState({redirect: '/'});
      } else {
        this.setState({ loginError: 'Username or password is incorrect' });
      }
    }).catch(console.log);
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (this.state.username === '') {
      isError = true;
      errors.usernameError = 'Username is required';
    } else {
      errors.usernameError = '';
    }

    if (!this.state.password) {
      isError = true;
      errors.passwordError = 'Password is required';
    } else {
      errors.passwordError = '';
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;
    const user = {
      username: this.state.username,
      password: this.state.password
    }
    this.login(user);
  }

  handleInputChange(e) {
    const target = e.target;
    this.setState({ [target.name]: target.value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    
    return (
      <div>
        <h1>Login</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field>
            <label>Username</label>
            <input placeholder='Username' name='username' onChange={this.handleInputChange} />
            {
              this.state.usernameError &&
              <Message error header={this.state.usernameError} />
            }
          </Form.Field>
          <Form.Field>
            <label>Password</label>
            <input placeholder='Password' name='password' type='password' onChange={this.handleInputChange} />
            {
              this.state.passwordError &&
              <Message error header={this.state.passwordError} />
            }
          </Form.Field>
          {
            this.state.loginError &&
            <Message error header={this.state.loginError} />
          }
          <Button positive floated='left' type='submit'>Login</Button>
          <Button negative floated='right' as={Link} to={'/'}>Cancel</Button>
        </Form>
      </div>
    );
  }
}