import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form } from 'semantic-ui-react';

import { updateNestedValue, getValue } from '../../../utils/objectUtils';
import createFieldsFromConfig from './createFieldsFromConfig';
import { createLabel } from '../../../utils/stringUtils';

export default class MyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputs: props.inputs
    }
  }

  validateForm() {
    let isFormValid = true;
    let updatedForm = this.state.inputs;
    
    for (let field of Object.keys(updatedForm)) {
      let isFieldValid = this.validateField(updatedForm, updatedForm, field);
      isFormValid &= isFieldValid;
    }

    this.setState({ inputs: updatedForm });

    return isFormValid;
  }

  validateField(form, group, field) {
    const fieldConfig = group[field];
    const value = fieldConfig.value;
    const validation = fieldConfig.validation || {};
    let error = '';
    const label = fieldConfig.label ? getValue(fieldConfig.label, this.state.inputs) : createLabel(field);
    
    //Check if field is applicable
    if (fieldConfig.checkCondition && !fieldConfig.checkCondition(this.state.inputs)) {
      group[field].error = '';
      return true;
    }

    //Loop over group fields
    if (fieldConfig.type === 'Group') {
      let isValid = true;
      for (let subField of Object.keys(fieldConfig.fields)) {
        isValid &= this.validateField(form, fieldConfig.fields, subField);
      }
      return isValid;
    }

    //Validate field
    if (
      validation.required && (!value || !value.length) &&
      (fieldConfig.type !== 'number' || isNaN(value))
    ) {
      error = this.getErrorMessage(validation.required, `${label} is required`);
    }

    if (!error && validation.equal) {
      const validationValue = getValue(validation.equal.value, form);
      if (value !== validationValue) {
        error = this.getErrorMessage(validation.equal, `${label} is invalid`)
      }
    }

    if (!error && validation.minLength) {
      const validationValue = getValue(validation.minLength.value, form);
      if (value.length < validationValue) {
        error = this.getErrorMessage(
          validation.minLength,
          `${label} should be at least ${validationValue} characters`
        );
      }
    }

    if (!error && validation.email) {
      // eslint-disable-next-line
      const validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!validEmailRegex.test(value)) {
        error = this.getErrorMessage(validation.email, `Invalid email-address`);
      }
    }

    //Update error message in the form/group
    group[field].error = error;
    return error.length === 0;
  }

  getErrorMessage(validation, defaultMessage) {
    if (!validation.message) {
      return defaultMessage;
    }
    return getValue(validation.message, this.state.inputs);
  }

  handleSubmit(e) {
    e.preventDefault();
    const isFormValid = this.validateForm();

    if (!isFormValid) return;

    this.props.submit(this);
  }

  handleValueChange(field, value) {
    const updatedForm = updateNestedValue(this.state.inputs, field, value);
    this.setState({ inputs: updatedForm });
  }

  render() {
    const formFields = createFieldsFromConfig(this, this.handleValueChange.bind(this));

    let cancelButtonAttributes = {};
    if (this.props.cancelCallback) {
      cancelButtonAttributes = { onClick: this.props.cancelCallback };
    } else {
      cancelButtonAttributes = {
        as: Link,
        to: this.props.cancelUrl || '/'
      };
    }

    return (
      <div>
        <h1>{ this.props.title }</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          { formFields }
          <Button positive floated='left' type='submit'>{ this.props.submitButtonText || 'Submit' }</Button>
          <Button negative floated='right' { ...cancelButtonAttributes }>Cancel</Button>
        </Form>
      </div>
    );
  }
}