import React, { Component } from 'react';
import Redirect from 'react-router-dom/Redirect';
import { Grid, GridColumn, List, Loader, Dimmer, Segment } from 'semantic-ui-react';

import Item from '../items/Items/Item';
import ItemDetails from '../items/ItemDetails/ItemDetails';
import ListWithDetails from '../../hoc/ListWithDetails';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';
import { statusesInProgress } from '../../utils/userItems/statusUtils';

export default class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      userItemsInProgress: [],
      itemsLoaded: false,
      redirect: undefined
    }
  }

  componentWillMount() {
    if (isLoggedIn()) {
      this.getUserItemsInProgress();
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ redirect: '' });
  }

  getUserItemsInProgress() {
    fetch(`/api/userItems/${getUser().id}/inProgress`).then((userItemsInProgress) => {
      this.setState({ userItemsInProgress, itemsLoaded: true });
    })
  }

  setStatusChanged(userItem) {
    if (statusesInProgress.includes(userItem.status)) return;
    this.deleteItemFromList(userItem.item);
    this.setState({ redirect: '/home' });
  }

  deleteItemFromList(item) {
    const items = this.state.userItemsInProgress.filter((stateItem) =>
      stateItem.item._id !== item._id
    );
    this.setState({ userItemsInProgress: items, itemStatusChanged: null });
  }

  render() {
    if (!isLoggedIn()) {
      return <Redirect to='/items' />
    }
  
    const { itemsLoaded, redirect}  = this.state;
		if (redirect) return <Redirect to={redirect} />;

    let userItemsInProgress = {};
    if (this.state.userItemsInProgress.length > 0) {
      userItemsInProgress = this.state.userItemsInProgress
        .sort((userItem1, userItem2) => userItem1.item.title < userItem2.item.title ? -1 : 1)
        .map((userItem) => (
          <Item
            key={ userItem._id }
            item={ userItem.item }
            status={ userItem.status }
            match={'/home'} />
        ))
        .reduce((userItemsByStatus, userItem) => {
          const status = userItem.props.status;
          return {
            ...userItemsByStatus,
            [status]: [ ...(userItemsByStatus[status] || []), userItem ]
          }
        }, []);
    }

    return (
      <ListWithDetails
        isLoaded={itemsLoaded}
        detailsRoutePath='/home/:titleId'
        renderDetailsComponent={(props) => {
          let item = this.state.userItemsInProgress.filter((ui) =>
            ui.item.title_id === props.match.params.titleId
          )[0].item;
          return (
            <ItemDetails
              {...props}
              match='/home'
              item={item}
              onDelete={ this.deleteItemFromList.bind(this) }
              onChangeStatus={ this.setStatusChanged.bind(this) } />
          )
        }} >
          <h1 style={{ marginBottom: '1em' }}>Items in progress</h1>
          {
            itemsLoaded
            ? (
              Object.values(userItemsInProgress).length > 0
              ? (
                <Grid>
                  {
                    Object.keys(userItemsInProgress).map((status) => (
                      <GridColumn key={ status } style={{ width: '30%', minWidth: '250px', marginBottom: '2em' }}>
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
      </ListWithDetails>
    );
  }
}