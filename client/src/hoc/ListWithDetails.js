import React from 'react';
import { Grid, GridColumn } from 'semantic-ui-react';

export default (props) => {
  const listWidth = props.listWidth || 8;
  const detailsComponent = props.detailsComponent;

  return (
    <Grid>
      <GridColumn width={ detailsComponent ? listWidth : 16 }>
        { props.children }
      </GridColumn>
      {
        detailsComponent &&
        <GridColumn width={ 16 - listWidth }>
          { detailsComponent }
        </GridColumn>
      }
    </Grid>
  );
}