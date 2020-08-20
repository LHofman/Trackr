import React from 'react';
import { Checkbox, Dropdown, Form, Message, TextArea } from 'semantic-ui-react';

import { capitalizeFirstLetter, createLabel } from '../../../utils/stringUtils';
import { getValue } from '../../../utils/objectUtils';

export default (field, config, formComponent, handleValueChange) => {
  return getInput(field, config, formComponent, handleValueChange, '');
}

const getInput = (field, config, formComponent, handleValueChange, group) => {
  const label = config.label ? getValue(config.label, formComponent.state.inputs) : createLabel(field);
  const placeholder = config.placeholder ||  capitalizeFirstLetter(field);
  const defaultValue = config.value !== undefined ? config.value : '';
  const valueKey = (group ? `${group}.fields.` : '') + `${field}.value`;

  const createInput = createCreateInput(label, config.error);
  const syncValue = createSyncValue(valueKey, handleValueChange);

  if (config.checkCondition && !config.checkCondition(formComponent.state.inputs)) {
    return null;
  }

  switch (config.type || 'text') {
    case 'Component':
      const attributes = config.attributes;
      if (attributes.includeChangeHandler) {
        attributes.handleValueChange = handleValueChange;
        delete attributes.includeChangeHandler;
      }
      return React.createElement(
        config.component,
        {
          key: config.key || undefined,
          ...attributes
        }
      );
    case 'Group':
      const subGroup = (group ? `${group}.fields.` : '') + field;
      return (
        <Form.Group key={ config.key || undefined }>
          { Object.keys(config.fields).map((subField, index) => getInput(
            subField,
            { ...config.fields[subField], key: index },
            formComponent,
            handleValueChange,
            subGroup
          )) }
        </Form.Group>
      );
    case 'Checkbox':
      return createInput(
        <Checkbox
          label={ label }
          name={ field }
          { ...config.extraAttributes }
          checked={ defaultValue ? true : false } 
          onChange={(param, data) => syncValue(data.checked)} />,
        {
          ...config,
          hideLabel: true
        }
      );
    case 'Select': 
      return createInput(
        <Dropdown
          name={ field }
          fluid selection
          { ...config.extraAttributes }
          placeholder={ placeholder }
          value={ defaultValue }
          options={ config.options }
          onChange={ (param, data) => syncValue(data.value) }
          onAddItem={ (e, value) => config.onAddItem(value.value, formComponent) || null } />,
        config
      );
    case 'TextArea':
      return createInput(
        <TextArea
          autoHeight
          name={ field }
          { ...config.extraAttributes }
          placeholder={ placeholder }
          value={ defaultValue }
          onChange={ (e) => onInputChangeEvent(e, syncValue) } />,
        config
      );
    case 'date':
    case 'password':
    case 'number':
    case 'text':
      return createInput(
        <input
          type={ config.type }
          name={ field }
          { ...config.extraAttributes }
          placeholder={ placeholder }
          value={ defaultValue }
          onChange={ (e) => onInputChangeEvent(e, syncValue) } />,
        config
      );
    default: return null;
  }
}

const createCreateInput = (label, error) => (input, config = {}) => {
  if (config.noFormField) return input;
  return (
    <Form.Field
      key={ (config.key || config.key === 0) ? config.key : undefined }
      required={ (config.validation || {}).required ? true : false }
      width={ config.width || 16 } >
      { !config.hideLabel && <label>{ label }</label> }
      { input }
      { error && <Message error header={error} /> }
    </Form.Field>
  );
}

const onInputChangeEvent = (event, syncValue) => {
  syncValue(event.target.value);
}

const createSyncValue = (valueKey, handleValueChange) => (value) => {
  handleValueChange(valueKey, value);
}