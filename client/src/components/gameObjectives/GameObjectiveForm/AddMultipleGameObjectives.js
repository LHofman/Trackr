import React, { Component } from 'react';

import MyForm from '../../UI/Form/MyForm';

import getUser from '../../../utils/getUser';

export default class AddMultipleGameObjectives extends Component {
  submitForm(formComponent) {
    const form = formComponent.state.inputs;

    let lastIndex = this.props.lastIndex;
    const objectives = form.objectives.value.split('\n').map((objective) => {
      return {
        createdBy: getUser().id,
        index: ++lastIndex,
        objective,
      }
    });

    this.props.updateGameObjectives(objectives);
  }

  render() {
    const inputs = {
      objectives: {
        type: 'TextArea',
        validation: {
          required: true
        },
        style: { minHeight: 200 },
        placeholder: 'Objective 1\nObjective 2\nObjective 3'
      },
    };

    return (
      <MyForm
        title='Add Gameobjectives'
        inputs={ inputs }
        submitButtonText='Add Objectives'
        submit={ this.submitForm.bind(this) }
        cancelUrl={ this.props.cancelUrl }
        otherButton={{
          text: 'Add advanced objective',
          callback: this.props.toggleForm,
        }} />
    );
  }
}