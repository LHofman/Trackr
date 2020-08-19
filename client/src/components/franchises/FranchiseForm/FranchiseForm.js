import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import MyForm from '../../UI/Form/MyForm';

import getUser from '../../../utils/getUser';

export default class FranchiseForm extends Component {
  constructor() {
    super();
    this.state = {
      details: {},
      isLoaded: false,
      redirect: undefined
    }
  }

  componentWillMount() {
    if (this.props.getDetails) {
      this.props.getDetails().then((details) => {
        this.setState({ ...details, isLoaded: true });
      });
    } else {
      this.setState({ isLoaded: true });
    }
  }

  updateFranchise(newFranchise) {
    return this.props.updateFranchise(newFranchise).then(franchise => {
      this.setState({redirect: `/franchises/${franchise.title_id}`});
    }).catch(console.log);
  }

  submitForm(formComponent) {
    const form = formComponent.state.inputs;

    const newFranchise = {
      title: form.title.value,
      description: form.description.value,
      createdBy: getUser().id
    }
    this.updateFranchise(newFranchise);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    if (!this.state.isLoaded) {
      return null;
    }

    const defaultValues = this.state.details;

    const inputs = {
      title: {
        value: defaultValues.title || '',
        validation: {
          required: true
        }
      },
      description: {
        type: 'TextArea',
        value: defaultValues.description || '',
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