import moment from 'moment';
import { ChangeEvent, ReactElement, SyntheticEvent } from 'react';
import { Dropdown, Input, Label, Menu, Rating } from 'semantic-ui-react';

import { capitalizeFirstLetter, createLabel } from '../../../utils/stringUtils';

import { Option } from '../../../types/shared/form';
import { Maybe } from '../../../types/shared/general';
import { ValueChangeHandler } from '../../../types/shared/handlers';

type Control = 'Date' | 'Rating' | 'Select';
type Options = {
  label?: string;
  placeholder?: string;
  value?: any;
  options?: Option<string>[];
};

export default function getFilterControl(
  name: string,
  control: Control,
  handleValueChange: ValueChangeHandler,
  options: Options = {}
): Maybe<ReactElement> {
  const label = options.label || createLabel(name);
  const placeholder = options.placeholder ||  capitalizeFirstLetter(name);
  const defaultValue = options.value || '';
  const selectOptions = options.options || [];

  switch (control) {
    case 'Date': 
      return createControl(label, <Input 
        type='date'
        name={name}
        value={moment(defaultValue).isValid() ? moment(defaultValue).format('YYYY-MM-DD') : ''}
        onChange={
          (event) => handleValueChange(event.currentTarget.name, event.currentTarget.value)
        } />
      );
    case 'Rating':
      return createControl(label, <Rating
        icon='star'
        clearable
        maxRating={10}
        defaultRating={ defaultValue || 0 }
        onRate={(param, data) => handleValueChange(name, data.rating)} />
      );
    case 'Select':
      return createControl(label, <Dropdown
        placeholder={placeholder}
        name={name}
        selection
        search
        value={defaultValue}
        options={[{ text: '---No Filter---', value: '' }, ...selectOptions]}
        onChange={(param, data) => handleValueChange(name, data.value)} />
      );
    default: return null;
  }
}

const createControl = (label: string, input: ReactElement): ReactElement => (
  <Menu.Item>
    <Label>{label}</Label>
    {input} <br/>
  </Menu.Item>
);