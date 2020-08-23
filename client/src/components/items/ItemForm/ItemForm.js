import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import MyForm from '../../UI/Form/MyForm';

import { getArtistOptions, getGenreOptions, getPlatformOptions } from '../getFieldOptions';
import getInputs from './getInputs';
import getUser from '../../../utils/getUser';
import hasStarted from '../../../utils/hasStarted';

export default class ItemForm extends Component {
  constructor() {
    super();
    this.state = {
      allArtists: [],
      allGenres: [],
      allPlatforms: [],
      details: {},
      isLoaded: false,
      redirect: undefined
    }
  }

  componentWillMount() {
    const getDetailsPromise = this.props.getDetails ? this.props.getDetails() : Promise.resolve({ details: {} });

    Promise.all([
      getDetailsPromise.then((details) => {
        this.setState({ ...details })
      }),
      getArtistOptions().then((allArtists) => { this.setState({ allArtists }) }),
      getGenreOptions().then((allGenres) => { this.setState({ allGenres }) }),
      getPlatformOptions().then((allPlatforms) => { this.setState({ allPlatforms }) })
    ]).then(() => this.setState({ isLoaded: true }));
  }

  updateItem(newItem) {
    return this.props.updateItem(newItem).then(item => {
      this.setState({redirect: `/items/${item.title_id}`});
    }).catch(console.log);
  }

  submitForm(formComponent) {
    const form = formComponent.state.inputs;
    
    const releaseDateFields = form.releaseDateGroup.fields;
    const releaseDateDvdFields = form.releaseDateDvdGroup.fields;
  
    const newItem = {
      createdBy: getUser().id,
      description: form.description.value,
      genres: form.genres.value,
      links: form.links.value,
      releaseDate: releaseDateFields.releaseDateStatus.value === 'Date'
        ? new Date(releaseDateFields.releaseDate.value).toISOString()
        : undefined,
      releaseDateStatus: releaseDateFields.releaseDateStatus.value,
      title: form.title.value,
      type: form.type.value
    }
  
    switch (form.type.value) {
      case 'Album': case 'Book': newItem.artists = form.artists.value; break;
      case 'Movie': 
        newItem.releaseDateDvd = releaseDateDvdFields.releaseDateDvdStatus.value !== 'Date'
          ? undefined
          : new Date(releaseDateDvdFields.releaseDateDvd.value).toISOString();
        newItem.releaseDateDvdStatus = releaseDateDvdFields.releaseDateDvdStatus.value;
        newItem.artists = form.artists.value;
        break;
      case 'TvShow': 
        newItem.ongoing = hasStarted(releaseDateFields.releaseDateStatus.value, releaseDateFields.releaseDate.value)
          ? form.ongoing.value
          : true; 
        newItem.artists = form.artists.value;
        break;
      case 'Video Game': newItem.platforms = form.platforms.value; break;
      default:
    }
  
    this.updateItem(newItem);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    if (!this.state.isLoaded) {
      return null;
    }

    const inputs = getInputs(this.state.details, {
      allArtists: this.state.allArtists,
      allGenres: this.state.allGenres,
      allPlatforms: this.state.allPlatforms
    });

    return (
      <MyForm
        title={ this.props.title }
        inputs={ inputs }
        submitButtonText={ this.props.submitButtonText }
        submit={ this.submitForm.bind(this) } />
    );
  }
}