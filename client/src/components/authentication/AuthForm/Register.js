import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import fetch from '../../../utils/fetch';
import MyForm from '../../UI/Form/MyForm';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      redirect: undefined
    };
  }

  registerUser(newUser, formComponent) {
    return fetch(`/users/register`, 'post', false, newUser).then(res => {
      console.log(res);
      return fetch(`/users/authenticate`, 'post', false, {
        username: newUser.username,
        password: newUser.password
      })
    }).then(body => {
      localStorage.setItem('auth_token', body.token);
      localStorage.setItem('user', JSON.stringify(body.user));
      this.setState({ redirect: '/' });
    })
    .catch(res => {
      try{
        res.json().then(body => {
          formComponent.setState({ usernameError: body.msg });
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  submitForm(formComponent) {
    const form = formComponent.state.inputs;

    const newUser = {
      email: form.email.value,
      username: form.username.value,
      name: form.name.value,
      firstName: form.firstName.value,
      password: form.password.value
    };
    this.registerUser(newUser, formComponent);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />;

    const inputs = {
      email: {
        validation: {
          required: true,
          email: true
        }
      },
      username: {
        validation: {
          required: true,
        }
      },
      firstName: {},
      name: {},
      password: {
        type: 'password',
        validation: {
          required: true,
          minLength: { value: 7 }
        }
      },
      passwordConfirmation: {
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Confirm Password',
        validation: {
          required: true,
          equal: {
            value: (form) => form.password.value,
            message: 'Passwords do not match'
          }
        }
      }
    };

    return (
      <MyForm
        title='Register'
        inputs={ inputs }
        submitButtonText='Register'
        submit={ this.submitForm.bind(this) } />
    );
  }
}
