import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Message } from 'semantic-ui-react';

import MyForm from '../UI/Form/MyForm';

import fetch from '../../utils/fetch';
import { updateNestedValue } from '../../utils/objectUtils';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      redirect: undefined
    }
  }

  login(user, formComponent) {
    return fetch(`/users/authenticate`, 'post', false, user).then(body => {
      if (body.success) {
        localStorage.setItem('auth_token', body.token);
        localStorage.setItem('user', JSON.stringify(body.user));
        this.setState({redirect: '/'});
      } else {
        let updatedForm = updateNestedValue(
          formComponent.state.inputs,
          'loginError.attributes.header',
          'Username or password is incorrect'
        );
        formComponent.setState({ inputs: updatedForm });
      }
    }).catch(console.log);
  }

  submitForm(formComponent) {
    const form = formComponent.state.inputs;

    const user = {
      username: form.username.value,
      password: form.password.value
    }
    this.login(user, formComponent);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    const inputs = {
      username: {
        validation: {
          required: true
        }
      },
      password: {
        type: 'password',
        validation: {
          required: true,
        }
      },
      loginError: {
        checkCondition: (form) => form.loginError.attributes.header,
        type: 'Component',
        component: Message,
        attributes: { error: true, header: this.state.loginError }
      }
    };

    return (
      <MyForm
        title='Login'
        inputs={ inputs }
        submitButtonText='Login'
        submit={ this.submitForm.bind(this) } />
    );
  }
}