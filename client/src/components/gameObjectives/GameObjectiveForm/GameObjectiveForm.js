import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import MyForm from '../../UI/Form/MyForm';

import getUser from '../../../utils/getUser';

export default class GameObjectiveForm extends Component {
  constructor() {
    super();
    this.state = {
      details: {},
      isLoaded: false
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

  updateGameObjective(newGameObjective) {
    this.props.updateGameObjective(newGameObjective);
  }

  submitForm(formComponent) {
    const form = formComponent.state.inputs;

    const newObjective = {
      createdBy: getUser().id,
      amount: form.amount.value || 1,
      hint: form.hint.value,
      index: form.index.value,
      objective: form.objective.value,
      spoiler: form.spoiler.value
    }

    this.updateGameObjective(newObjective);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    if (!this.state.isLoaded) {
      return null;
    }

    const defaultValues = this.state.details;

    const inputs = {
      index: {
        type: 'number',
        value: defaultValues.index || 0,
        validation: {
          required: true
        }
      },
      objective: {
        value: defaultValues.objective || '',
        validation: {
          required: true
        }
      },
      amount: {
        type: 'number',
        value: defaultValues.amount || 1,
        extraAttributes: {
          min: 1
        }
      },  
      spoiler: {
        type: 'Checkbox',
        label: 'name contains spoilers',
        value: defaultValues.spoiler
      },
      hint: {
        type: 'TextArea',
        value: defaultValues.hint
      }
    };

    return (
      <MyForm
        title={ this.props.title }
        inputs={ inputs }
        submitButtonText={ this.props.submitButtonText }
        submit={ this.submitForm.bind(this) }
        cancelUrl={ this.props.cancelUrl }
        { ...this.props } />
    );
  }
}