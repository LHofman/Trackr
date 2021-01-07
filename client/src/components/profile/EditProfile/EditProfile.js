import React, { Component } from 'react';
import { Button, Form, Icon, Message } from 'semantic-ui-react';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';

export default class EditProfile extends Component {
  constructor() {
    super();

    const user = getUser();

    this.state = {
      user: user,
      editing: false,
      email: user.email,
      emailError: '',
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
      passwordError: ''
    }

    this.cancelEdit = this.cancelEdit.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onInputChangeEvent = this.onInputChangeEvent.bind(this);
    this.saveField = this.saveField.bind(this);
  }

  cancelEdit() {
    this.setState({ editing: false });
  }

  onEditClick(field) {
    this.setState({ editing: field });
  }

  onInputChangeEvent(e) {
    this.setState({ [e.target.name]: e.target.value});
  }

  saveField(e) {
    const field = e.target.name;
    const value = this.state[field];
    const postData = {};
    let apiEndpoint = `/api/users/${this.state.user.id}`;
    let errorField = `${field}Error`;

    if (field === 'password') {
      if (!value || value.length < 7) {
        this.setState({ passwordError: 'Password should be at least 7 characters' });
        return;
      } else if (value !== this.state.passwordConfirmation) {
        this.setState({ passwordError: 'Password confirmation does not match' });
        return;
      }
      apiEndpoint = `/users/${this.state.user.id}/changePassword`;
      postData.currentPassword = this.state.currentPassword;
      postData.newPassword = value;
    } else {
      postData[field] = value;
    }

    return fetch(apiEndpoint, 'put', true, postData).then(res => {
      if (res.success === false) {
        this.setState({ [errorField]: res.msg });
        return;
      }

      if (field === 'username') {
        const user = {...this.state.user, ...postData};
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({ user });
      }
      this.setState({ editing: false, password: '', currentPassword: '', passwordConfirmation:'' });
    }).catch(console.log);
  }

  render() {
    const { editing, email, emailError, password, currentPassword, passwordConfirmation, passwordError } = this.state;

    return (
      <div>
        <h2>Profile Settings</h2>
        <Form error>
          <Form.Field width='7'>
            <label>Email-Address</label>
            {
              editing !== 'email'
              ? <div>
                {email} &nbsp;
                <Icon name='edit' color='orange' onClick={ (e) => this.onEditClick('email') } />
              </div> : <div>
                <div style={{ display: 'flex' }}>
                  <input name='email' value={email} style={{ marginRight: '1em' }}
                    onChange={ this.onInputChangeEvent } />
                  <Button name='email' positive onClick={ this.saveField }>Save</Button>
                  <Button negative onClick={ this.cancelEdit }>Cancel</Button>
                </div>
                { emailError && <Message error header={emailError} /> }
              </div>
            }
          </Form.Field>
          <Form.Field width='7'>
            <label>Password</label>
            {
              editing !== 'password'
              ? <div>
                <Button onClick={ (e) => this.onEditClick('password') }> Change Password </Button>
              </div> : <div>
                <label>Current Password</label>
                <input name='currentPassword' type='password' value={currentPassword}
                  onChange={ this.onInputChangeEvent } />
                <label>New Password</label>
                <input name='password' type='password' value={password}
                  onChange={ this.onInputChangeEvent } />
                <label>Confirm Password</label>
                <div style={{ display: 'flex' }}>
                  <input name='passwordConfirmation' type='password' value={passwordConfirmation} style={{ marginRight: '1em' }}
                    onChange={ this.onInputChangeEvent } />
                  <Button name='password' positive onClick={ this.saveField }>Save</Button>
                  <Button negative onClick={ this.cancelEdit }>Cancel</Button>
                </div>
                { passwordError && <Message error header={passwordError} /> }
              </div>
            }
          </Form.Field>
        </Form>
      </div>
    );
  }
}