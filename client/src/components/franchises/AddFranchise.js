import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Message, TextArea } from 'semantic-ui-react';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';

export default class AddFranchise extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      titleError: '',
      description: undefined,
      redirect: undefined
    }

    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  addFranchise(newFranchise) {
    return fetch('/api/franchises', 'post', true, newFranchise).then(franchise => {
      this.setState({redirect: `/franchises/${franchise.title_id}`});
    }).catch(console.log);
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (!this.state.title) {
      isError = true;
      errors.titleError = 'Title is required';
    } else {
      errors.titleError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  handleInputChange(e) {
    const target = e.target;
    this.handleValueChange(target.name, target.value);
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;

    const { title, description } = this.state;
    const newFranchise = {
      title,
      description,
      createdBy: getUser().id
    }
    this.addFranchise(newFranchise);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    return (
      <div>
        <h1>Add Franchise</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field required>
            <label>Title</label>
            <input placeholder='Title' name='title' onChange={this.handleInputChange} />
            {
              this.state.titleError &&
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <TextArea autoHeight placeholder='Description' name='description' onChange={this.handleInputChange} />
          </Form.Field>
          <Button positive floated='left' type='submit'>Create Franchise</Button>
          <Button negative floated='right' as={Link} to={'/franchises'}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
