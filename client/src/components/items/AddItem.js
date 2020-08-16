import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Form, Icon, Message, TextArea } from 'semantic-ui-react';

import fetch from '../../utils/fetch';
import getArtistType from './getArtistType';
import { getTypeOptions } from './getFieldOptions';
import getUser from '../../utils/getUser';
import hasStarted from '../../utils/hasStarted';
import releaseDateStatusOptions from './releaseDateStatusOptions';

export default class AddItem extends Component {
  constructor() {
    super();
    this.state = {
      allPlatforms: [],
      artists: [],
      artistsError: '',
      allArtists: [],
      description: undefined,
      links: [],
      newLinkTitle: '',
      newLinkUrl: '',
      newLinkError: '',
      ongoing: false,
      platforms: [],
      redirect: undefined,
      releaseDate: '',
      releaseDateError: '',
      releaseDateStatus: 'Date',
      releaseDateDvd: '',
      releaseDateDvdError: '',
      releaseDateDvdStatus: 'Date',
      title: '',
      titleError: '',
      type: 'Movie'
    }

    this.getAllPlatforms = this.getAllPlatforms.bind(this);
    this.getAllArtists = this.getAllArtists.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.removeLink = this.removeLink.bind(this);
  }

  componentWillMount() {
    this.getAllArtists();
    this.getAllPlatforms();
  }

  addLink() {
    const title = this.state.newLinkTitle;
    const url = this.state.newLinkUrl;
    
    if (!title || !url) {
      this.setState({newLinkError: 'Please enter a title and url'});
      return;
    }

    this.setState({
      links: [...this.state.links, {title, url, index: this.state.links.length}], 
      newLinkError: '',
      newLinkTitle: '',
      newLinkUrl: ''
    });
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

    if (this.state.type === 'Movie' && this.state.releaseDateDvdStatus === 'Date' && this.state.releaseDateDvd === '') {
      isError = true;
      errors.releaseDateDvdError = 'Dvd ReleaseDate is required';
    } else {
      errors.releaseDateDvdError = '';
    }

    if (getArtistType(this.state.type) !== null && this.state.artists.length === 0) {
      isError = true;
      errors.artistsError = `at least 1 ${getArtistType(this.state.type)} is required`;
    } else {
      errors.artistsError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  getAllPlatforms() {
    fetch('/api/platforms').then(platforms => {
      this.setState({ allPlatforms: platforms.map(platform => { return {text: platform, value: platform}; } ) });
    });
  }

  getAllArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ allArtists: artists.map(artist => { return {text: artist, value: artist}}) })
    });
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
      links,
      releaseDate, 
      releaseDateStatus, 
      releaseDateDvd, 
      releaseDateDvdStatus, 
      title, 
      type
    } = this.state;
    const newItem = {
      createdBy: getUser().id,
      description,
      links,
      releaseDate: releaseDateStatus === 'Date' ? new Date(releaseDate).toISOString() : undefined,
      releaseDateStatus,
      title,
      type
    }
    switch (type) {
      case 'Album': case 'Book': newItem.artists = this.state.artists; break;
      case 'Movie': 
        newItem.releaseDateDvd = releaseDateDvdStatus !== 'Date' ? undefined : new Date(releaseDateDvd).toISOString();
        newItem.releaseDateDvdStatus = releaseDateDvdStatus;
        newItem.artists = this.state.artists;
        break;
      case 'TvShow': 
        newItem.ongoing = hasStarted(this.state.releaseDateStatus, this.state.releaseDate) ? this.state.ongoing : true; 
        newItem.artists = this.state.artists;
        break;
      case 'Video Game': newItem.platforms = platforms; break;
      default:
    }
    this.addItem(newItem);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  newArtist(e, { value }) {
    this.setState({ allArtists: [{text: value, value}, ...this.state.allArtists]});
  }

  newPlatform(e, {value}) {
    this.setState({allPlatforms: [{text: value, value}, ...this.state.allPlatforms]});
  }

  removeLink(e, data) {
    const index = data.name.substring(5);
    let found = false;
    const links = [];

    for (let i = 0; i < this.state.links.length; i++) {
      let link = this.state.links[i];
      if (link.index === index) {
        found = true;
        continue;
      }
      if (found) {
        link.index--;
      }
      links.push(link);
    }
    this.setState({links});
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    const links = this.state.links.map(link => <Form.Group key={link.index}>
      <Form.Field width={3}>
        <input disabled value={link.title}/>
      </Form.Field>
      <Form.Field width={7}>
        <input disabled value={link.url}/>
      </Form.Field>
      <Form.Field>
        <Button color='orange' type='button' onClick={(e, data) => this.removeLink(e, data)} animated name={`link_${link.index}`}>
          <Button.Content visible>Remove Link</Button.Content>
          <Button.Content hidden>
            <Icon name='arrow down' />
          </Button.Content>
        </Button>
      </Form.Field>
    </Form.Group>)

    console.log(getArtistType(this.state.type));

    return (
      <div>
        <h1>Add Item</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>

          <Form.Field required>
            <label>Type</label>
            <Dropdown name='type' fluid selection value={this.state.type}
              options={getTypeOptions()} onChange={(param, data) => this.handleValueChange('type', data.value)} />
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
            getArtistType(this.state.type) !== null &&
            <Form.Field required>
              <label>{ getArtistType(this.state.type) }</label>
              <Dropdown name='artists' fluid selection search multiple allowAdditions placeholder='Artists' options={this.state.allArtists} 
                onAddItem={this.newArtist.bind(this)} value={this.state.artists} onChange={(param, data) => this.handleValueChange('artists', data.value)} />
              {
                this.state.artistsError &&
                <Message error header={this.state.artistsError} />
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
          {
            this.state.type === 'Movie' &&
            <Form.Group>
              <Form.Field required width={3}>
                <label>Dvd ReleaseDate Status</label>
                <Dropdown name='releaseDateDvdStatus' fluid selection value={this.state.releaseDateDvdStatus}
                  options={releaseDateStatusOptions} onChange={(param, data) => this.handleValueChange('releaseDateDvdStatus', data.value)} />
              </Form.Field>
              {
                this.state.releaseDateDvdStatus === 'Date' &&
                <Form.Field required width={13}>
                  <label>Dvd Release Date</label>
                  <input type='date' name='releaseDateDvd' onChange={this.handleInputChange} />
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
            <TextArea autoHeight placeholder='Description' name='description' onChange={this.handleInputChange} />
          </Form.Field>
          {
            (this.state.type === 'TvShow' && hasStarted(this.state.releaseDateStatus, this.state.releaseDate)) &&
            <Form.Field required>
              <Checkbox label='Ongoing' name='ongoing' onChange={(param, data) => this.handleValueChange('ongoing', data.checked)} />
            </Form.Field>
          }
          {
            this.state.type === 'Video Game' &&
            <Form.Field>
              <Dropdown name='platformers' placeholder='Platforms' clearable={1} fluid search multiple selection allowAdditions options={this.state.allPlatforms} 
                onAddItem={this.newPlatform.bind(this)} onChange={(param, data) => this.handleValueChange('platforms', data.value)}/>
            </Form.Field>
          }
          <Form.Field><label>Links</label></Form.Field>
          {links}
          <Form.Group>
            <Form.Field required width={3}>
              <input placeholder='Title' name='newLinkTitle' value={this.state.newLinkTitle} onChange={this.handleInputChange}/>
            </Form.Field>
            <Form.Field required width={7}>
              <input placeholder='Url' name='newLinkUrl' value={this.state.newLinkUrl} onChange={this.handleInputChange}/>
            </Form.Field>
            <Form.Field>
              <Button type='button' onClick={this.addLink.bind(this)} animated>
                <Button.Content visible>Add Link</Button.Content>
                <Button.Content hidden>
                  <Icon name='arrow up' />
                </Button.Content>
              </Button>
            </Form.Field>
          </Form.Group>
          {
            this.state.newLinkError &&
            <Message error header={this.state.newLinkError} />
          }
          <Button positive floated='left' type='submit'>Create Item</Button>
          <Button negative floated='right' as={Link} to={'/'}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
