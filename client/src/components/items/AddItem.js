import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Form, Message, TextArea } from 'semantic-ui-react';

import extendedEquals from '../../utils/extendedEquals';
import fetch from '../../utils/fetch';
import getArtistType from './getArtistType';
import getUser from '../../utils/getUser';
import hasStarted from '../../utils/hasStarted';
import releaseDateStatusOptions from './releaseDateStatusOptions';
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
      releaseDateStatus: 'Date',
      description: undefined,
      artist: '',
      artistError: '',
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

    if (this.state.releaseDateStatus === 'Date' && this.state.releaseDate === '') {
      isError = true;
      errors.releaseDateError = 'ReleaseDate is required';
    } else {
      errors.releaseDateError = '';
    }

    if (extendedEquals(this.state.type, 'Album', 'Book') && !this.state.artist) {
      isError = true;
      errors.artistError = `${getArtistType(this.state.type)} is required`;
    } else {
      errors.artistError = '';
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
    const { type, title, releaseDate, releaseDateStatus, description } = this.state;
    const newItem = {
      type,
      title,
      description,
      releaseDate: releaseDateStatus === 'Date' ? new Date(releaseDate).toISOString() : undefined,
      releaseDateStatus,
      createdBy: getUser().id
    }
    switch (type) {
      case 'Album': case 'Book': newItem.artist = this.state.artist; break;
      case 'TvShow': newItem.ongoing = hasStarted(this.state.releaseDateStatus, this.state.releaseDate) ? this.state.ongoing : true; break;
      default:
    }
    this.addItem(newItem);
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
          <Form.Field required>
            <label>Type</label>
            <Dropdown name='type' fluid selection value={this.state.type}
              options={typeOptions} onChange={(param, data) => this.handleValueChange('type', data.value)} />
          </Form.Field>
          <Form.Field required>
            <label>Title</label>
            <input placeholder='Title' name='title' onChange={this.handleInputChange} />
            {
              this.state.titleError &&
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          {
            extendedEquals(this.state.type, 'Album', 'Book') &&
            <Form.Field required>
              <label>{ getArtistType(this.state.type) }</label>
              <input placeholder={ getArtistType(this.state.type) } name='artist' onChange={this.handleInputChange} />
              {
                this.state.artistError &&
                <Message error header={this.state.artistError} />
              }
            </Form.Field>
          }
          <Form.Group>
            <Form.Field required width={3}>
              <label>ReleaseDate Status</label>
              <Dropdown name='releaseDateStatus' fluid selection value={this.state.releaseDateStatus}
                options={releaseDateStatusOptions} onChange={(param, data) => this.handleValueChange('releaseDateStatus', data.value)} />
            </Form.Field>
            {
              this.state.releaseDateStatus === 'Date' &&
              <Form.Field required width={13}>
                <label>Release Date</label>
                <input type='date' name='releaseDate' onChange={this.handleInputChange} />
                {
                  this.state.releaseDateError &&
                  <Message error header={this.state.releaseDateError} />
                }
              </Form.Field>
            }
          </Form.Group>
          <Form.Field>
            <label>Description</label>
            <TextArea autoHeight placeholder='Description' name='description' onChange={this.handleInputChange} />
          </Form.Field>
          {
            (this.state.type === 'TvShow' && hasStarted(this.state.releaseDateStatus, this.state.releaseDate)) &&
            <Form.Field required>
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
