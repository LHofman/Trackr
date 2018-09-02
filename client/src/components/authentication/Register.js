import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message } from 'semantic-ui-react';

import fetch from '../../utils/fetch';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      firstName: '',
      email: '',
      emailError: '',
      username: '',
      usernameError: '',
      password: '',
      passwordError: '',
      passwordConfirmation: '',
      passwordConfirmationError: '',
      redirect: undefined
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  registerUser(newUser) {
    return fetch(`/users/register`, 'post', false, newUser)
    .then(res => {
      console.log(res);
      return fetch(`/users/authenticate`, 'post', false, {
        username: newUser.username,
        password: newUser.password
      })
    }).then(body => {
      localStorage.setItem('id_token', body.token);
      localStorage.setItem('user', JSON.stringify(body.user));
      this.setState({ redirect: '/' });
    })
    .catch(res => {
      try{
        res.json().then(body => {
          this.setState({usernameError: body.msg});
        });
      } catch(err) {
        console.log(err);
      }
    });
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    // eslint-disable-next-line
    const validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!this.state.email) {
      isError = true;
      errors.emailError = 'Email is required';
    } else if (!validEmailRegex.test(this.state.email)) {
      isError = true;
      errors.emailError = 'Invalid email';
    } else {
      errors.emailError = '';
    }

    const password = this.state.password;

    if (!password) {
      isError = true;
      errors.passwordError = 'Password is required';
    } else if (password.length < 7) {
      isError = true;
      errors.passwordError = 'Password should be at least 7 characters';
    } else {
      errors.passwordError = '';
    }

    if (
      errors.passwordError === '' &&
      password !== this.state.passwordConfirmation
    ) {
      isError = true;
      errors.passwordConfirmationError = 'Passwords do not match';
    } else {
      errors.passwordConfirmationError = '';
    }

    const username = this.state.username;

    if (!username) {
      isError = true;
      errors.usernameError = 'Username is required';
    } else {
      errors.usernameError = '';
    }

    this.setState({
      ...this.state,
      ...errors
    });

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.checkForErrors()) return;

    const newUser = {
      email: this.state.email,
      username: this.state.username,
      name: this.state.name,
      firstName: this.state.firstName,
      password: this.state.password
    };
    this.registerUser(newUser);
  }

  handleInputChange(e) {
    const target = e.target;
    this.setState({ [target.name]: target.value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />;

    return (
      <div>
        <h1>Register</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field required>
            <label>Email</label>
            <input
              placeholder="Email"
              name="email"
              onChange={this.handleInputChange}
            />
            {this.state.emailError && (
              <Message error header={this.state.emailError} />
            )}
          </Form.Field>
          <Form.Field required>
            <label>Username</label>
            <input
              placeholder="Username"
              name="username"
              onChange={this.handleInputChange}
            />
            {this.state.usernameError && (
              <Message error header={this.state.usernameError} />
            )}
          </Form.Field>
          <Form.Field>
            <label>First Name</label>
            <input
              placeholder="FirstName"
              name="firstName"
              onChange={this.handleInputChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Name</label>
            <input
              placeholder="Name"
              name="name"
              onChange={this.handleInputChange}
            />
          </Form.Field>
          <Form.Field required>
            <label>Password</label>
            <input
              placeholder="Password"
              name="password"
              type="password"
              onChange={this.handleInputChange}
            />
            {this.state.passwordError && (
              <Message error header={this.state.passwordError} />
            )}
          </Form.Field>
          <Form.Field required>
            <label>Confirm Password</label>
            <input
              placeholder="Confirm Password"
              name="passwordConfirmation"
              type="password"
              onChange={this.handleInputChange}
            />
            {this.state.passwordConfirmationError && (
              <Message error header={this.state.passwordConfirmationError} />
            )}
          </Form.Field>
          <Button positive floated="left" type="submit">
            Submit
          </Button>
          <Button negative floated="right" as={Link} to={'/'}>
            Cancel
          </Button>
        </Form>
      </div>
    );
  }
}
