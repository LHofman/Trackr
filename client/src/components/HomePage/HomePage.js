import React, { Component } from 'react';
import Redirect from 'react-router-dom/Redirect';
import { Grid, GridColumn, List, Loader, Dimmer, Segment } from 'semantic-ui-react';

import Item from '../items/Items/Item';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';

export default class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      userItemsInProgress: [],
      itemsLoaded: false
    }
  }

  componentWillMount() {
    this.getUserItemsInProgress();
  }

  getUserItemsInProgress() {
    fetch(`/api/userItems/${getUser().id}/inProgress`).then((userItemsInProgress) => {
      this.setState({ userItemsInProgress, itemsLoaded: true });
    })
  }

  render() {
    if (!isLoggedIn()) {
      return <Redirect to='/items' />
    }

    let userItemsInProgress = {};
    if (this.state.userItemsInProgress.length > 0) {
      userItemsInProgress = this.state.userItemsInProgress
        .sort((userItem1, userItem2) => userItem1.item.title < userItem2.item.title ? -1 : 1)
        .map((userItem) => <Item key={ userItem._id } item={ userItem.item } status={ userItem.status }/>)
        .reduce((userItemsByStatus, userItem) => {
          const status = userItem.props.status;
          return {
            ...userItemsByStatus,
            [status]: [ ...(userItemsByStatus[status] || []), userItem ]
          }
        }, []);
      }

    return (
      <div>
        <h1 style={{ marginBottom: '1em' }}>Items in progress</h1>
        {
          this.state.itemsLoaded
          ? (
            Object.values(userItemsInProgress).length > 0
            ? (
              <Grid>
                {
                  Object.keys(userItemsInProgress).map((status) => (
                    <GridColumn style={{ width: '30%', minWidth: '250px', marginBottom: '2em' }}>
                      <h2>{ status }</h2>
                      <List style={{ height: '50vh', overflow: 'auto' }}>{ userItemsInProgress[status] }</List>
                    </GridColumn>
                  ))
                }
              </Grid>
            ) : <h4>You have no items in progress</h4>
          ) : (
            <Segment style={{ height: '25vh' }}>
              <Dimmer active>
                <Loader content='Loading' />
              </Dimmer>
            </Segment> 
          )
        }
      </div>
    );
  }
}