import React from 'react';
import Media from 'react-media';
import { Route, Switch, matchPath } from 'react-router-dom';
import { Grid, GridColumn } from 'semantic-ui-react';

import { SPLIT_SCREEN_MIN_WIDTH } from '../constants/screenConstants';

export default (props) => {
  const listWidth = props.listWidth || 8;

  if (!matchPath(props.location.pathname, props.detailsRoutePath)) {
    return props.children;
  }

  return (
    <Media query={`(min-width: ${SPLIT_SCREEN_MIN_WIDTH})`}>
      {matches => (matches && props.isLoaded) ? (
        <Grid>
          <GridColumn width={listWidth}>
            {props.children}
          </GridColumn>
          <GridColumn width={ 16 - listWidth }>
            <Switch>
              <Route exact path={props.detailsRoutePath}
                render={ (routeProps) => 
                  props.renderDetailsComponent({ ...routeProps, isSideComponent: true })
                } />
            </Switch>
          </GridColumn>
        </Grid>
      ) : props.children}
    </Media>
  );
}