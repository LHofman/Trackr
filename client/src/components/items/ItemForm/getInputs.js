import moment from 'moment-timezone';

import Links from '../../UI/Form/CustomFields/Links';

import { addItemToSelect } from '../../../utils/formUtils';
import { getDateStatusOptions, getTypeOptions } from '../getFieldOptions';
import getArtistType from '../getArtistType';
import hasStarted from '../../../utils/hasStarted';

export default (defaultValues, options) => ({
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
    }
  },
  artists: {
    checkCondition: (form) => getArtistType(form.type.value) !== null,
    type: 'Select',
    label: (form) => getArtistType(form.type.value),
    extraAttributes: { search: true, multiple: true, allowAdditions: true },
    options: options.allArtists,
    value: defaultValues.artists || [],
    validation: {
      required: {
        message: (form) => `At least 1 ${getArtistType(form.type.value)} is required`
      }
    },
    onAddItem: addItemToSelect('allArtists', 'artists', this)
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
        width: 13
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
        width: 13
      }
    }
  },
  ongoing: {
    checkCondition: (form) => (
      form.type.value === 'TvShow' &&
      hasStarted(form.releaseDateGroup.fields.releaseDateStatus.value, form.releaseDateGroup.fields.releaseDate.value)
    ),
    type: 'Checkbox',
    value: defaultValues.ongoing || false
  },
  description: {
    type: 'TextArea',
    value: defaultValues.description || '',
  },
  genres: {
    type: 'Select',
    extraAttributes: { search: true, multiple: true, allowAdditions: true },
    options: options.allGenres,
    value: defaultValues.genres || [],
    onAddItem: addItemToSelect('allGenres', 'genres', this)
  },
  platforms: {
    checkCondition: (form) => form.type.value === 'Video Game',
    type: 'Select',
    extraAttributes: { search: true, multiple: true, allowAdditions: true },
    options: options.allPlatforms,
    value: defaultValues.platforms || [],
    onAddItem: addItemToSelect('allPlatforms', 'platforms', this)
  },
  links: {
    type: 'Component',
    component: Links,
    attributes: {
      links: defaultValues.links || [],
      includeChangeHandler: true
    },
    value: defaultValues.links || [],
  }
});