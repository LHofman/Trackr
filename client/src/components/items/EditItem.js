import moment from 'moment-timezone';
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Form, Message, TextArea } from 'semantic-ui-react';

import extendedEquals from '../../utils/extendedEquals';
import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getArtistType from './getArtistType';
import hasStarted from '../../utils/hasStarted';
import releaseDateStatusOptions from './releaseDateStatusOptions';
import typeOptions from './typeOptions';

export default class EditItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      details: {},
      id: '',
      type: '',
      title: '',
      titleError: '',
      releaseDate: '',
      releaseDateError: '',
      releaseDateStatus: '',
      description: undefined,
      artist: '',
      artistError: '',
      ongoing: false,
      redirect: undefined
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentWillMount() {
    this.getItemDetails();
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
      errors.artistError = `${ getArtistType(this.state.type) } is required`;
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

  editItem(newItem) {
    const itemId = this.state.id;
    return fetch(`/api/items/${itemId}`, 'put', true, newItem).then(item => {
        this.setState({redirect: `/items/${item.title_id}`});
      }).catch(console.log);
  }

  getItemDetails() {
    const title_id = this.props.match.params.titleId;
    return fetch(`/api/items/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({
            details,
            id: details._id,
            type: details.type,
            title: details.title,
            description: details.description,
            releaseDate: details.releaseDate,
            releaseDateStatus: details.releaseDateStatus,
            artist: details.artist,
            ongoing: details.ongoing
          });
        } else this.setState({ redirect: `/items/${title_id}` });
			}).catch(reason => 
				this.setState({redirect: '/'})
			);
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
      releaseDate: releaseDateStatus === 'Date' ? new Date(releaseDate).toISOString() : undefined,
      releaseDateStatus,
      description
    }
    switch (type) {
      case 'Album': case 'Book': newItem.artist = this.state.artist; break;
      case 'TvShow': newItem.ongoing = hasStarted(this.state.releaseDateStatus, this.state.releaseDate) ? this.state.ongoing : true; break;
      default:
    }
    this.editItem(newItem);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />



    return (
      <div>
        <h1>Edit Item</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field required>
            <label>Type</label>
            <Dropdown placeholder='Type' fluid selection options={typeOptions} name='type' value={this.state.type} onChange={(param, data) => this.handleValueChange('type', data.value)} />
          </Form.Field>
          <Form.Field required>
            <label>Title</label>
            <input placeholder='Title' name='title' value={this.state.title} onChange={this.handleInputChange} />
            {
							this.state.titleError && 
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          {
						extendedEquals(this.state.type, 'Album', 'Book') &&
            <Form.Field required>
              <label>{ getArtistType(this.state.type) }</label>
              <input placeholder={ getArtistType(this.state.type) } name='artist' value={this.state.artist} onChange={this.handleInputChange} />
              {
								this.state.artistError &&
                <Message error header={this.state.artistError} />
              }
            </Form.Field>
          }
          <Form.Group>
            <Form.Field required width={3}>
              <label>ReleaseDate Status</label>
              <Dropdown fluid selection options={releaseDateStatusOptions} name='releaseDateStatus' value={this.state.releaseDateStatus} onChange={(param, data) => this.handleValueChange('releaseDateStatus', data.value)} />
            </Form.Field>
            {
              this.state.releaseDateStatus === 'Date' &&
              <Form.Field required width={13}>
                <label>Release Date</label>
                <input type='date' name='releaseDate' value={moment(this.state.releaseDate).format('YYYY-MM-DD')} onChange={this.handleInputChange} />
                {
                  this.state.releaseDateError && 
                  <Message error header={this.state.releaseDateError} />
                }
              </Form.Field>
            }
          </Form.Group>
          <Form.Field>
            <label>Description</label>
            <TextArea autoHeight placeholder='Description' name='description' value={this.state.description} onChange={this.handleInputChange} />
          </Form.Field>
          {
						(this.state.type === 'TvShow' && hasStarted(this.state.releaseDateStatus, this.state.releaseDate)) &&
            <Form.Field required>
              <Checkbox label='Ongoing' name='ongoing' checked={this.state.ongoing} onChange={(param, data) => this.handleValueChange('ongoing', data.checked)} />
            </Form.Field>
          }
          <Button positive floated='left' type='submit'>Save Item</Button>
          <Button negative floated='right' as={Link} to={`/items/${this.state.id}`}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
