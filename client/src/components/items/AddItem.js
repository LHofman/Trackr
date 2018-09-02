import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Form, Dropdown, Checkbox, Message } from 'semantic-ui-react';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import typeOptions from './typeOptions';

export default class AddItem extends Component {
  constructor() {
    super();
    this.state = {
      type: 'Movie',
      title: '',
      titleError: '',
      releaseDate: '',
      releaseDateError: '',
      author: '',
      authorError: '',
      ongoing: false,
      redirect: undefined
    }
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  addItem(newItem) {
    return fetch('/api/items', 'post', true, newItem).then(item => {
      this.setState({redirect: `/items/${item.title_id}`});
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

    if (this.state.releaseDate === '') {
      isError = true;
      errors.releaseDateError = 'ReleaseDate is required';
    } else {
      errors.releaseDateError = '';
    }

    if (this.state.type === 'Book' && !this.state.author) {
      isError = true;
      errors.authorError = 'Author is required';
    } else {
      errors.authorError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;
    const type = this.state.type;
    const newItem = {
      type,
      title: this.state.title,
      releaseDate: new Date(this.state.releaseDate).toISOString(),
      createdBy: getUser().id
    }
    switch (type) {
      case 'Book': newItem.author = this.state.author; break;
      case 'TvShow': newItem.ongoing = this.state.ongoing; break;
      default:
    }
    this.addItem(newItem);
  }

  handleInputChange(e) {
    const target = e.target;
    this.handleValueChange(target.name, target.value);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />


    return (
      <div>
        <h1>Add Item</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field>
            <label>Type</label>
            <Dropdown name='type' fluid selection value={this.state.type}
              options={typeOptions} onChange={(param, data) => this.handleValueChange('type', data.value)} />
          </Form.Field>
          <Form.Field>
            <label>Title</label>
            <input placeholder='Title' name='title' onChange={this.handleInputChange} />
            {
              this.state.titleError &&
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          {
            this.state.type === 'Book' &&
            <Form.Field>
              <label>Author</label>
              <input placeholder='Author' name='author' onChange={this.handleInputChange} />
              {
                this.state.authorError &&
                <Message error header={this.state.authorError} />
              }
            </Form.Field>
          }
          <Form.Field>
            <label>Release Date</label>
            <input type='date' name='releaseDate' onChange={this.handleInputChange} />
            {
              this.state.releaseDateError &&
              <Message error header={this.state.releaseDateError} />
            }
          </Form.Field>
          {
            this.state.type === 'TvShow' &&
            <Form.Field>
              <Checkbox label='Ongoing' name='ongoing' onChange={(param, data) => this.handleValueChange('ongoing', data.checked)} />
            </Form.Field>
          }
          <Button positive floated='left' type='submit'>Create Item</Button>
          <Button negative floated='right' as={Link} to={'/'}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
