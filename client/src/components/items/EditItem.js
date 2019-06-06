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
      allPlatforms: [],
      artists: [],
      artist: '',
      artistError: '',
      description: undefined,
      details: {},
      id: '',
      ongoing: false,
      platforms: [],
      releaseDate: '',
      releaseDateError: '',
      releaseDateStatus: '',
      releaseDateDvd: '',
      releaseDateDvdError: '',
      releaseDateDvdStatus: '',
      redirect: undefined,
      title: '',
      titleError: '',
      type: '',
    }

    this.getArtists = this.getArtists.bind(this);
    this.getAllPlatforms = this.getAllPlatforms.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentWillMount() {
    this.getItemDetails();
    this.getArtists();
    this.getAllPlatforms();
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

    if (this.state.type === 'Movie' && this.state.releaseDateDvdStatus === 'Date' && this.state.releaseDateDvd === '') {
      isError = true;
      errors.releaseDateDvdError = 'Dvd ReleaseDate is required';
    } else {
      errors.releaseDateDvdError = '';
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

  getAllPlatforms() {
    fetch('/api/platforms').then(allPlatforms => {
      this.setState({allPlatforms: allPlatforms.map(platform => {return {text: platform, value: platform}})});
    });
  }

  getArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ artists: artists.map(artist => { return {text: artist, value: artist}}) });
    });
  }

  getItemDetails() {
    const title_id = this.props.match.params.titleId;
    return fetch(`/api/items/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({
            id: details._id,
            artist: details.artist,
            details,
            description: details.description,
            ongoing: details.ongoing,
            platforms: details.platforms,
            releaseDate: details.releaseDate,
            releaseDateStatus: details.releaseDateStatus,
            releaseDateDvd: details.releaseDateDvd,
            releaseDateDvdStatus: details.releaseDateDvdStatus,
            title: details.title,
            type: details.type,
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
    const { 
      description,
      platforms,
      releaseDate, 
      releaseDateStatus, 
      releaseDateDvd, 
      releaseDateDvdStatus, 
      title, 
      type
    } = this.state;
    const newItem = {
      type,
      title,
      releaseDate: releaseDateStatus === 'Date' ? new Date(releaseDate).toISOString() : undefined,
      releaseDateStatus,
      description
    }
    switch (type) {
      case 'Album': case 'Book': newItem.artist = this.state.artist; break;
      case 'Movie': 
        newItem.releaseDateDvd = releaseDateDvdStatus !== 'Date' ? undefined : new Date(releaseDateDvd).toISOString();
        newItem.releaseDateDvdStatus = releaseDateDvdStatus;
        break;
      case 'TvShow': newItem.ongoing = hasStarted(this.state.releaseDateStatus, this.state.releaseDate) ? this.state.ongoing : true; break;
      case 'Video Game': newItem.platforms = platforms;
      default:
    }
    this.editItem(newItem);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  newArtist(e, { value }) {
    this.setState({ artists: [{text: value, value}, ...this.state.artists]});
  }

  newPlatform(e, {value}) {
    this.setState({allPlatforms: [{text: value, value}, ...this.state.allPlatforms]});
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
            <Dropdown fluid selection options={typeOptions} name='type' value={this.state.type} onChange={(param, data) => this.handleValueChange('type', data.value)} />
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
              <Dropdown name='artist' fluid selection search allowAdditions placeholder='Artist' options={this.state.artists} 
                onAddItem={this.newArtist.bind(this)} value={this.state.artist} onChange={(param, data) => this.handleValueChange('artist', data.value)} />
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
          {
            this.state.type === 'Movie' &&
            <Form.Group>
              <Form.Field required width={3}>
                <label>Dvd ReleaseDate Status</label>
                <Dropdown fluid selection options={releaseDateStatusOptions} name='releaseDateDvdStatus' value={this.state.releaseDateDvdStatus} onChange={(param, data) => this.handleValueChange('releaseDateDvdStatus', data.value)} />
              </Form.Field>
              {
                this.state.releaseDateDvdStatus === 'Date' &&
                <Form.Field required width={13}>
                  <label>Dvd Release Date</label>
                  <input type='date' name='releaseDateDvd' value={moment(this.state.releaseDateDvd).format('YYYY-MM-DD')} onChange={this.handleInputChange} />
                  {
                    this.state.releaseDateDvdError && 
                    <Message error header={this.state.releaseDateDvdError} />
                  }
                </Form.Field>
              }
            </Form.Group>
          }
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
          {
            this.state.type === 'Video Game' &&
            <Form.Field>
              <Dropdown name='platformers' placeholder='Platforms' clearable={1} fluid search multiple selection allowAdditions options={this.state.allPlatforms} value={this.state.platforms}
                onAddItem={this.newPlatform.bind(this)} onChange={(param, data) => this.handleValueChange('platforms', data.value)}/>
            </Form.Field>
          }
          <Button positive floated='left' type='submit'>Save Item</Button>
          <Button negative floated='right' as={Link} to={`/items/${this.state.id}`}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
