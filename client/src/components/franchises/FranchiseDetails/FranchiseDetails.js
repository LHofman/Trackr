import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link, Redirect } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Confirm, Container, Dropdown, Grid, Icon, Input, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';
import Franchise from '../Franchise';
import FranchiseDetailsItem from './FranchiseDetailsItem';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import filterItem from '../../items/Items/filterItem';
import getItemsFilterControls from '../../items/Items/getItemsFilterControls';
import getItemsFilterDefaults from '../../items/Items/getItemsFilterDefaults';
import getItemsSortControls from '../../items/Items/getItemsSortControls';
import sortItems from '../../items/Items/sortItems';

export default class FranchiseDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
      activePage: 1,
      addItems: [],
      addParentFranchises: [],
      addSubFranchises: [],
			confirmationAlert: false,
			details: '',
      franchisesOptions: [],
      itemOptions: [],
      itemOptionsLoaded: false,
			parentFranchises: [],
      redirect: undefined,
      allArtists: [],
      allPlatforms: [],
      filters: getItemsFilterDefaults(),
      sort: { field: 'title', order: 'asc' }
		}

    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.removeItem = this.removeItem.bind(this);
		this.toggleConfirmationAlert = this.toggleConfirmationAlert.bind(this);
    this.removeSubFranchise = this.removeSubFranchise.bind(this);
    this.removeFromParentFranchise = this.removeFromParentFranchise.bind(this);
	}

  componentWillMount() {
    this.getFranchise().then(() => {
      this.getItems();
      this.getParentFranchises().then(() => {
        this.getAllFranchises();
      });
    });
    this.getAllArtists();
    this.getAllPlatforms();
	}

	addItems() {
		fetch(`/api/franchises/${this.state.details._id}/items/add`, 'put', true, this.state.addItems).then(completeItems => {
      const { details, itemOptions } = this.state;
      details.items.push(...completeItems);
      const completeItemsIds = completeItems.map(item => item._id);
      this.setState({ 
        details, 
        itemOptions: itemOptions.filter(item => completeItemsIds.indexOf(item.key) === -1), 
        addItems: [] 
      });
    });
	}
	
	addParentFranchises() {
		fetch(`/api/franchises/addFranchiseToMultiple/${this.state.details._id}`, 'put', true, this.state.addParentFranchises).then(completeParentFranchises => {
      const { parentFranchises, franchisesOptions } = this.state;
      parentFranchises.push(...completeParentFranchises);
      const completeParentFranchisesIds = completeParentFranchises.map(franchise => franchise._id);
      this.setState({ 
        parentFranchises, 
        franchisesOptions: franchisesOptions.filter(franchise => completeParentFranchisesIds.indexOf(franchise.key) === -1), 
        addParentFranchises: [] 
      });
    });
	}
	
	addSubFranchises() {
		fetch(`/api/franchises/${this.state.details._id}/subFranchises/add`, 'put', true, this.state.addSubFranchises).then(completeSubFranchises => {
      const { details, franchisesOptions } = this.state;
      details.subFranchises.push(...completeSubFranchises);
      const completeSubFranchisesIds = completeSubFranchises.map(subFranchise => subFranchise._id);
      this.setState({ 
        details, 
        franchisesOptions: franchisesOptions.filter(franchise => completeSubFranchisesIds.indexOf(franchise.key) === -1), 
        addSubFranchises: [] 
      });
    });
	}
	
  changePage(activePage) {
    this.handlePaginationChange(null, { activePage });
  }

	getFranchise() {
		const title_id = this.props.match.params.titleId;
		return fetch(`/api/franchises/title_id/${title_id}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({ details })
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
  }

	getAllFranchises() {
		fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({ franchisesOptions: 
        franchises.filter(franchise => 
          this.state.details.subFranchises.map(subFranchise => subFranchise._id).indexOf(franchise._id) === -1 &&
          this.state.parentFranchises.map(parentFranchise => parentFranchise._id).indexOf(franchise._id) === -1 &&
          this.state.details._id !== franchise._id
        )
				.sort((i1, i2) => i1.title.toLowerCase() < i2.title.toLowerCase() ? -1 : 1)
        .map(franchise => { return { key: franchise._id, value: franchise._id, text: franchise.title } })
      });
		});
	}

	getItems() {
		fetch('/api/items').then(items => {
      if (!items || items === null) return;
      this.setState({ itemOptions: 
        items.filter(item => this.state.details.items.map(item => item._id).indexOf(item._id) === -1)
				.sort((i1, i2) => i1.title.toLowerCase() < i2.title.toLowerCase() ? -1 : 1)
        .map(item => { return { key: item._id, value: item._id, text: `${item.title} (${new Date(item.releaseDate).getFullYear()})` } }),
        itemOptionsLoaded: true
      });
		});
	}

  getPagination(totalPages) {
    return (
      <div>
        <MediaQuery query='(max-width: 550px)'>
          <Button icon='fast backward' onClick={() => this.changePage(1)} />
          <Button icon='step backward' onClick={() => this.changePage(this.state.activePage-1)} />
          <Label content={`${this.state.activePage}/${totalPages}`} color='teal' />
          <Button icon='step forward' onClick={() => this.changePage(this.state.activePage+1)} />
          <Button icon='fast forward' onClick={() => this.changePage(totalPages)} />
        </MediaQuery>
        <MediaQuery query='(min-width: 550px)'>
          <Pagination activePage={this.state.activePage} totalPages={totalPages} onPageChange={this.handlePaginationChange.bind(this)} />
        </MediaQuery>
      </div>
    )
	}
	
	getParentFranchises() {
		return fetch(`/api/franchises/bySubFranchise/${this.state.details._id}`).then(parentFranchises => {
      if (!parentFranchises || parentFranchises === null) return;
      this.setState({ parentFranchises });
		});
	}

  getAllArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ allArtists: artists.map(artist => { return { text: artist, value: artist } }) });
    });
  }

  getAllPlatforms() {
    fetch('/api/platforms').then(platforms => {
      this.setState({allPlatforms: platforms.map(platform => { return { text: platform, value: platform } }) });
    });
  }

	handleAddItemsChange(e, { value }) {
		this.setState({ addItems: value })
	}

	handleAddParentFranchisesChange(e, { value }) {
		this.setState({ addParentFranchises: value })
	}

	handleAddSubFranchisesChange(e, { value }) {
		this.setState({ addSubFranchises: value })
	}

  handlePaginationChange(e, { activePage }) {
    this.setState({ activePage });
    animateScroll.scrollToTop();
  }

  handleFilterChange(filter, value) {
    const filters = {
      ...this.state.filters,
      [filter]: value
    };

    this.setState({ filters });
    this.setState({ activePage: 1 });
  }

  handleSortChange(field, order) {
    this.setState({ sort: { field, order } });
  }

	onDelete() {
		const franchiseId = this.state.details._id;
		return fetch(`/api/franchises/${franchiseId}`, 'delete', true).then(res => 
			this.setState({redirect: '/franchises'})
		);
	}

  removeItem(item) {
    fetch(`/api/franchises/${this.state.details._id}/items/remove`, 'put', true, [item._id]).then(completeItems => {
      const { details, itemOptions } = this.state;
      itemOptions.push({ key: item._id, value: item._id, text: item.title })
      const completeItemsIds = completeItems.map(item => item._id);
      details.items = details.items.filter(item => completeItemsIds.indexOf(item._id) === -1)
      this.setState({ 
        details, 
        itemOptions
      });
    });
  }

  removeFromParentFranchise(franchise) {
    fetch(`/api/franchises/${franchise._id}/subFranchises/remove`, 'put', true, [this.state.details._id]).then(completeFranchise => {
			let { parentFranchises, franchisesOptions } = this.state;
      franchisesOptions.push({ key: franchise._id, value: franchise._id, text: franchise.title })
      parentFranchises = parentFranchises.filter(parentFranchise => parentFranchise._id !== franchise._id)
      this.setState({ 
        parentFranchises, 
        franchisesOptions
      });
    });
  }

  removeSubFranchise(franchise) {
    fetch(`/api/franchises/${this.state.details._id}/subFranchises/remove`, 'put', true, [franchise._id]).then(completeFranchise => {
      const { details, franchisesOptions } = this.state;
      franchisesOptions.push({ key: franchise._id, value: franchise._id, text: franchise.title })
      details.subFranchises = details.subFranchises.filter(subFranchise => subFranchise._id !== franchise._id);
      this.setState({ 
        details, 
        franchisesOptions
      });
    });
  }

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
	}

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		
		const { 
      details,
      parentFranchises,
    } = this.state;
	

		let filteredItems = [];
		if (this.state.details.items) {
      filteredItems = this.state.details.items
        .filter(item => filterItem(item, this.state.filters))
        .sort(sortItems(this.state.sort));
		}

    const begin = (this.state.activePage - 1) * 100;
    const totalPages = Math.ceil(filteredItems.length / 100, 0);
    const items = filteredItems
      .slice(begin, begin + 100)
      .map(item => <FranchiseDetailsItem key={item._id} franchise={details} item={item} onDelete={this.removeItem} />);

    let subFranchises = [];
    if (details.subFranchises) {
      subFranchises = details.subFranchises
        .sort((f1, f2) => f1.title.toLowerCase() < f2.title.toLowerCase() ? -1 : 1)
        .map(franchise => <Franchise key={franchise._id} franchise={franchise} parent={details} onDelete={this.removeSubFranchise}/>);
    }
    
    let parentFranchisesList = [];
    if (parentFranchises) {
      parentFranchisesList = parentFranchises
        .sort((f1, f2) => f1.title.toLowerCase() < f2.title.toLowerCase() ? -1 : 1)
        .map(franchise => <Franchise key={franchise._id} franchise={franchise} parent={details} onDelete={this.removeFromParentFranchise}/>);
    }
    
		return (
			<Container>
				<Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={'/franchises'} />
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
          <Grid.Column style={{width: "45%", minWidth: "250px;"}}>
            <h2>Items</h2>
            <FilterMenu
              defaultFilters={this.state.filters}
              defaultSort={this.state.sort}
              handleFilterChange={this.handleFilterChange}
              handleSortChange={this.handleSortChange}
              getFilterControlsFunction={getItemsFilterControls}
              getFilterControlsFunctionExtraParams={{
                allArtists: this.state.allArtists,
                allPlatforms: this.state.allPlatforms
              }}
              getSortControlsFunction={getItemsSortControls} />
            <Dropdown placeholder='Add items' clearable={1} loading={!this.state.itemOptionsLoaded} multiple search minCharacters={2} selection options={this.state.itemOptions} onChange={this.handleAddItemsChange.bind(this)} value={this.state.addItems}/>&nbsp;&nbsp;&nbsp;
            <Button onClick={this.addItems.bind(this)}>Add</Button><br/><br/>
            {this.getPagination(totalPages)}
            <List>
              {items}
            </List>
            {this.getPagination(totalPages)}
          </Grid.Column>
          <Grid.Column style={{width: "45%", minWidth: "250px;"}}>
            <h2>Sub Franchises</h2>
            <Dropdown placeholder='Add subfranchises' clearable={1} multiple search minCharacters={2} selection options={this.state.franchisesOptions} onChange={this.handleAddSubFranchisesChange.bind(this)} value={this.state.addSubFranchises}/>&nbsp;&nbsp;&nbsp;
            <Button onClick={this.addSubFranchises.bind(this)}>Add</Button><br/><br/>
            <List bulleted>
              {subFranchises}
            </List>
            <h2>Parent Franchises</h2>
            <Dropdown placeholder='Add parentfranchises' clearable={1} multiple search minCharacters={2} selection options={this.state.franchisesOptions} onChange={this.handleAddParentFranchisesChange.bind(this)} value={this.state.addParentFranchises}/>&nbsp;&nbsp;&nbsp;
            <Button onClick={this.addParentFranchises.bind(this)}>Add</Button><br/><br/>
            <List bulleted>
              {parentFranchisesList}
            </List>
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
