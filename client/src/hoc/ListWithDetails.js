import React from 'react';
import Media from 'react-media';
import { Route } from 'react-router-dom';
import { Grid, GridColumn } from 'semantic-ui-react';

import { SPLIT_SCREEN_MIN_WIDTH } from '../constants/screenConstants';

export default (props) => {
  const listWidth = props.listWidth || 8;

  return (
    <Media query={`(min-width: ${SPLIT_SCREEN_MIN_WIDTH})`}>
      {matches => (matches && props.isLoaded) ? (
        <Grid>
          <GridColumn width={listWidth}>
            {props.children}
          </GridColumn>
          <GridColumn width={ 16 - listWidth }>
            <Route exact path={props.detailsRoutePath} render={props.renderDetailsComponent} />
          </GridColumn>
        </Grid>
      ) : props.children}
    </Media>
  );
}