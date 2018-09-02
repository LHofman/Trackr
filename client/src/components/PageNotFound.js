import React from 'react';
import { Grid } from 'semantic-ui-react';

export default () => (
  <Grid verticalAlign='middle' centered>
    <Grid.Row>
      <Grid.Column>
        <h1>404: Page Not Found</h1>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      <Grid.Column>
        <a href='/'>Go to the Home Page</a>
      </Grid.Column>
    </Grid.Row>
  </Grid>
)
