import React from 'react';
import { Button } from 'semantic-ui-react';

export default (props) => (
  <Button
    labelPosition='left'
    icon='left chevron'
    content='Back'
    onClick={ () => props.history.goBack() } />
);