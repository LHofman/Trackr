import React from 'react';
import moment from 'moment';
import { Dropdown, Input, Label, Menu } from 'semantic-ui-react';

import { capitalizeFirstLetter, createLabel } from '../../../utils/stringUtils';

export default (name, control, handleValueChange, options = {}) => {
  const label = options.label || createLabel(name);
  const placeholder = options.placeholder ||  capitalizeFirstLetter(name);
  const defaultValue = options.value || '';

  switch (control) {
    case 'Date': 
      return createControl(label, <Input 
        type='date'
        name={name}
        value={moment(defaultValue).isValid() ? moment(defaultValue).format('YYYY-MM-DD') : ''}
        onChange={(event) => onFilterChangeEvent(event, handleValueChange)} />
      );
    case 'Select':
      return createControl(label, <Dropdown
        placeholder={placeholder}
        name={name}
        selection
        search
        value={defaultValue}
        options={[{ text: '---No Filter---', value: '' }, ...options.options]}
        onChange={(param, data) => handleValueChange(name, data.value)} />
      );
    default: return null;
  }
}

const onFilterChangeEvent = (event, handleValueChange) => {
  handleValueChange(event.target.name, event.target.value);
}

const createControl = (label, input) => (
  <Menu.Item>
    <Label>{ label }</Label>
    { input } <br/>
  </Menu.Item>
);