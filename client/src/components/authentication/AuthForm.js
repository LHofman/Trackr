import moment from 'moment-timezone';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Links from '../../UI/Form/CustomFields/Links';
import MyForm from '../../UI/Form/MyForm';

import { addItemToSelect } from '../../../utils/formUtils';
import { getArtistOptions, getPlatformOptions, getTypeOptions, getDateStatusOptions } from '../getFieldOptions';
import getArtistType from '../getArtistType';
import getUser from '../../../utils/getUser';
import hasStarted from '../../../utils/hasStarted';

export default class AuthForm extends Component {
  constructor() {
    super();
    this.state = {
      redirect: undefined
    }
  }

  authenticate(newItem) {
    return this.props.updateItem(newItem).then(item => {
      this.setState({redirect: `/items/${item.title_id}`});
    }).catch(console.log);
  }

  submitForm (form) {
    const releaseDateFields = form.releaseDateGroup.fields;
    const releaseDateDvdFields = form.releaseDateDvdGroup.fields;
  
    const newItem = {
      createdBy: getUser().id,
      description: form.description.value,
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

    const defaultValues = this.state.details;

    const inputs = {
      type: {
        type: 'Select',
        options: getTypeOptions(),
        value: defaultValues.type || 'Movie',
        validation: {
          required: true
        }
      },
      title: {
        value: defaultValues.title || '',
        validation: {
          required: true
        },
        error: ''
      },
      artists: {
        checkCondition: (form) => getArtistType(form.type.value) !== null,
        type: 'Select',
        label: (form) => getArtistType(form.type.value),
        extraAttributes: { search: true, multiple: true, allowAdditions: true },
        options: this.state.allArtists,
        value: defaultValues.artists || [],
        validation: {
          required: {
            message: (form) => `At least 1 ${getArtistType(form.type.value)} is required`
          }
        },
        onAddItem: addItemToSelect('allArtists', 'artists', this),
        error: ''
      },
      releaseDateGroup: {
        type: 'Group',
        fields: {
          releaseDateStatus: {
            type: 'Select',
            options: getDateStatusOptions(),
            value: defaultValues.releaseDateStatus || 'Date',
            validation: {
              required: true
            },
            width: 3,
          },
          releaseDate: {
            type: 'date',
            checkCondition: (form) => form.releaseDateGroup.fields.releaseDateStatus.value === 'Date',
            value: defaultValues.releaseDate ? moment(defaultValues.releaseDate).format('YYYY-MM-DD') : '',
            validation: {
              required: true
            },
            width: 13,
            error: ''
          }
        }
      },
      releaseDateDvdGroup: {
        checkCondition: (form) => form.type.value === 'Movie',
        type: 'Group',
        fields: {
          releaseDateDvdStatus: {
            type: 'Select',
            label: 'Dvd Release Date Status',
            options: getDateStatusOptions(),
            value: defaultValues.releaseDateDvdStatus || 'Date',
            validation: {
              required: true
            },
            width: 3
          },
          releaseDateDvd: {
            type: 'date',
            checkCondition: (form) => form.releaseDateDvdGroup.fields.releaseDateDvdStatus.value === 'Date',
            label: 'Dvd Release Date',
            value: defaultValues.releaseDateDvd ? moment(defaultValues.releaseDateDvd).format('YYYY-MM-DD') : '',
            validation: {
              required: true
            },
            width: 13,
            error: ''
          }
        }
      },
      description: {
        type: 'TextArea',
        value: defaultValues.description || '',
      },
      ongoing: {
        checkCondition: (form) => (
          form.type.value === 'TvShow' &&
          hasStarted(form.releaseDateGroup.fields.releaseDateStatus.value, form.releaseDateGroup.fields.releaseDate.value)
        ),
        type: 'Checkbox',
        value: defaultValues.ongoing || false,
        validation: {
          required: true
        }
      },
      platforms: {
        checkCondition: (form) => form.type.value === 'Video Game',
        type: 'Select',
        extraAttributes: { search: true, multiple: true, allowAdditions: true },
        options: this.state.allPlatforms,
        value: defaultValues.platforms || [],
        onAddItem: addItemToSelect('allPlatforms', 'platforms', this)
      },
      links: {
        type: 'Component',
        component: Links,
        attributes: { links: defaultValues.links || [] },
        value: defaultValues.links || []
      }
    };

    return (
      <MyForm
        title={ this.props.title }
        inputs={ inputs }
        submitButtonText={ this.props.submitButtonText }
        submit={ this.submitForm.bind(this) } />
    );
  }
}