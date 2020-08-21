import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm, Container, Grid } from 'semantic-ui-react';

import Franchise from '../Franchise';
import FranchiseDetailsItem from './FranchiseDetailsItem';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import LinkedItems from '../../UI/LinkedItems/LinkedItems';
import { getItemsFiltersControlsExtraParams, getItemsFiltersControls, getItemsFiltersDefaults, filterItem } from '../../items/Items/itemsFilters';
import { itemsSortDefault, sortItems, getItemsSortControls } from '../../items/Items/itemsSorting';

export default class FranchiseDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
      activePage: 1,
      addParentFranchises: [],
      addSubFranchises: [],
			confirmationAlert: false,
			details: '',
      filterControlsExtraFields: {},
      franchisesOptions: [],
      franchisesOptionsLoaded: false,
      itemOptions: [],
      itemOptionsLoaded: false,
      items: [],
			parentFranchises: [],
      redirect: undefined,
      subFranchises: []
		}

    this.removeItem = this.removeItem.bind(this);
		this.toggleConfirmationAlert = this.toggleConfirmationAlert.bind(this);
    this.removeSubFranchise = this.removeSubFranchise.bind(this);
    this.removeFromParentFranchise = this.removeFromParentFranchise.bind(this);
	}

  componentWillMount() {
    this.init(this.props);
	}
	
	componentWillReceiveProps(props) {
		this.init(props);
	}

  init(props) {
    let titleId = '';
		if (props.franchise) {
			titleId = props.franchise.title_id;
		} else if (props.match) {
			titleId = props.match.params.titleId;
		} else {
			this.setState({ redirect: '/' });
			return;
    }
    
    this.getFranchise(titleId).then(() => {
      this.getItems();
      this.getParentFranchises().then(() => {
        this.getAllFranchises();
      });
    });

    getItemsFiltersControlsExtraParams().then(filterControlsExtraFields => {
      this.setState({ filterControlsExtraFields });
    });
  }

	addItems(itemsToAdd) {
		return fetch(`/api/franchises/${this.state.details._id}/items/add`, 'put', true, itemsToAdd);
	}
	
	addParentFranchises(addParentFranchises) {
		return fetch(`/api/franchises/addFranchiseToMultiple/${this.state.details._id}`, 'put', true, addParentFranchises);
	}
	
	addSubFranchises(addSubFranchises) {
    return fetch(`/api/franchises/${this.state.details._id}/subFranchises/add`, 'put', true, addSubFranchises);
	}
	
	getFranchise(titleId) {
		return fetch(`/api/franchises/title_id/${titleId}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({
        details,
        items: details.items,
        subFranchises: details.subFranchises
      })
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
  }

	getAllFranchises() {
		fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({
        franchisesOptions: 
          franchises.filter(franchise => 
            this.state.subFranchises.map(subFranchise => subFranchise._id).indexOf(franchise._id) === -1 &&
            this.state.parentFranchises.map(parentFranchise => parentFranchise._id).indexOf(franchise._id) === -1 &&
            this.state.details._id !== franchise._id
          ).sort((i1, i2) => i1.title.toLowerCase() < i2.title.toLowerCase() ? -1 : 1)
          .map(franchise => { return { key: franchise._id, value: franchise._id, text: franchise.title } }),
        franchisesOptionsLoaded: true
      });
		});
	}

	getItems() {
		fetch('/api/items').then(items => {
      if (!items || items === null) return;
      this.setState({
        itemOptions: 
          items.filter(item => this.state.details.items.map(item => item._id).indexOf(item._id) === -1)
          .sort(sortItems(itemsSortDefault))
          .map(item => { return { key: item._id, value: item._id, text: `${item.title} (${new Date(item.releaseDate).getFullYear()})` } }),
        itemOptionsLoaded: true
      });
		});
	}

	getParentFranchises() {
		return fetch(`/api/franchises/bySubFranchise/${this.state.details._id}`).then(parentFranchises => {
      if (!parentFranchises || parentFranchises === null) return;
      this.setState({ parentFranchises });
		});
	}

	onDelete() {
		const franchiseId = this.state.details._id;
		return fetch(`/api/franchises/${franchiseId}`, 'delete', true).then(res => 
			this.setState({redirect: '/franchises'})
		);
	}

  removeItem(item) {
    return fetch(`/api/franchises/${this.state.details._id}/items/remove`, 'put', true, [item._id]);
  }

  removeFromParentFranchise(franchise) {
    return fetch(`/api/franchises/${franchise._id}/subFranchises/remove`, 'put', true, [this.state.details._id]);
  }

  removeSubFranchise(franchise) {
    return fetch(`/api/franchises/${this.state.details._id}/subFranchises/remove`, 'put', true, [franchise._id]);
  }

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
  }
  
	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		
    const details = this.state.details;
	
		let backButtonAttributes = { as: Link, to: '/franchises' };
		if (this.props.onBackCallback) {
			backButtonAttributes = { onClick: () => this.props.onBackCallback() };
		}

		return (
			<Container>
				<Button labelPosition='left' icon='left chevron' content='Back' { ...backButtonAttributes } />
				<h1>{details.title}</h1>
				<Confirm
					open={this.state.confirmationAlert}
					header={`confirm deletion`}
					content={`Are you sure you want to delete ${details.title}?`}
					onCancel={this.toggleConfirmationAlert}
					onConfirm={this.onDelete.bind(this)}
				/>
				{
					details.description &&
					<div>
						{details.description}
						<br/><br/>
					</div>
        }
        <Grid>
          <Grid.Column style={{width: "45%", minWidth: "250px"}}>
            <LinkedItems
              title='Items'
              options={ this.state.itemOptions }
              optionsLoaded={ this.state.itemOptionsLoaded }
              items={ this.state.items }
              paginatedList={{
                filtersConfig:{
                  defaults: getItemsFiltersDefaults(),
                  getControls: getItemsFiltersControls(this.state.filterControlsExtraFields),
                  filterItem: filterItem
                },
                sortConfig:{
                  defaults: itemsSortDefault,
                  getControls: getItemsSortControls,
                  sortItems: sortItems
                }
              }}
              createItemComponent={ createItemComponent(this.state.details) }
              removeItem={ this.removeItem }
              addItems={ this.addItems.bind(this) }
              parentComponent={ this }
              stateKeyItems='items'
              stateKeyOptions='itemOptions'
              placeholder='Add items' 
              extraAttributes={{ minCharacters:2 }} />
          </Grid.Column>
          <Grid.Column style={{width: "45%", minWidth: "250px"}}>
            <LinkedItems
              title='Sub Franchises'
              options={ this.state.franchisesOptions }
              optionsLoaded={ this.state.franchisesOptionsLoaded }
              items={ this.state.subFranchises }
              createItemComponent={ createFranchiseItemComponent(this.state.details) }
              removeItem={ this.removeSubFranchise }
              addItems={ this.addSubFranchises.bind(this) }
              parentComponent={ this }
              stateKeyItems='subFranchises'
              stateKeyOptions='franchisesOptions'
              placeholder='Add sub franchises' />
            <br/><br/>
            <LinkedItems
              title='Parent Franchises'
              options={ this.state.franchisesOptions }
              optionsLoaded={ this.state.franchisesOptionsLoaded }
              items={ this.state.parentFranchises }
              createItemComponent={ createFranchiseItemComponent(this.state.details) }
              removeItem={ this.removeFromParentFranchise }
              addItems={ this.addParentFranchises.bind(this) }
              parentComponent={ this }
              stateKeyItems='parentFranchises'
              stateKeyOptions='franchisesOptions'
              placeholder='Add parent franchises' />
          </Grid.Column>
        </Grid>
				<br/>
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/franchises/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.toggleConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
      </Container>
    );
  }
}

const createFranchiseItemComponent = (details) => (onDelete) => (franchise) => {
  return <Franchise key={ franchise._id } franchise={ franchise } parent={ details } onDelete={ onDelete }/>
}

const createItemComponent = (details) => (onDelete) => (item) => {
  return <FranchiseDetailsItem key={ item._id } franchise={ details } item={ item } onDelete={onDelete} />
}