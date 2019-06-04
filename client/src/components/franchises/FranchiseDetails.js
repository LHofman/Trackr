import moment from 'moment';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link, Redirect } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Confirm, Container, Dropdown, Grid, Icon, Input, Label, List, Menu, Pagination, Sidebar } from 'semantic-ui-react';

import Franchise from './Franchise';
import FranchiseDetailsItem from './FranchiseDetailsItem';

import canEdit from '../../utils/canEdit';
import extendedEquals from '../../utils/extendedEquals';
import fetch from '../../utils/fetch';
import typeOptions from '../items/typeOptions';

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
			isSidebarVisible: false,
      itemOptions: [],
      itemOptionsLoaded: false,
			parentFranchises: [],
      redirect: undefined,
      releaseDateLowerLimit: '',
      releaseDateUpperLimit: '',
      sort: { field: 'title', order: 'asc' },
      typeFilter: '',
      titleFilter: ''
		}

    this.changePage = this.changePage.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.sort = this.sort.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
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

  filterFranchisesOptions(franchises) {
    return franchises.filter(franchise => 
      this.state.details.subFranchises.map(subFranchise => subFranchise._id).indexOf(franchise._id) === -1 &&
      this.state.parentFranchises.map(parentFranchise => parentFranchise._id).indexOf(franchise._id) === -1 &&
      this.state.details._id !== franchise._id
    );
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
        .map(item => { return { key: item._id, value: item._id, text: item.title } }),
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

  handleSortChange(event, { name, value }) {
    this.handleValueChange('sort', { field: name, order: value });
  }

  handleValueChange(name, value) {
    this.setState({ [name]: value });
  }

  hideSidebar() {
    this.setState({ isSidebarVisible: false });
  }

	onDelete() {
		const franchiseId = this.state.details._id;
		return fetch(`/api/franchises/${franchiseId}`, 'delete', true).then(res => 
			this.setState({redirect: '/franchises'})
		);
	}

  onFilterChange(event) {
    this.handleValueChange(event.target.name, event.target.value);
    this.setState({ activePage: 1 });
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') this.onFilterChange(event);
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

  sort(i1, i2) {
    const { field, order } = this.state.sort;
    const asc = order === 'asc' ? -1 : 1;

    const s1 = field === 'releaseDate' && i1.releaseDateStatus !== 'Date' ? 
      i1.releaseDateStatus : (
        field === 'releaseDateDvd' && i1.releaseDateDvdStatus !== 'Date' ? 
        i1.releaseDateDvdStatus : 
        i1[field].toString().toLowerCase()
      );
    const s2 = field === 'releaseDate' && i2.releaseDateStatus !== 'Date' ? 
      i2.releaseDateStatus : (
        field === 'releaseDateDvd' && i2.releaseDateDvdStatus !== 'Date' ? 
        i2.releaseDateDvdStatus :
        i2[field].toString().toLowerCase()
      );

    return s1 < s2 || (s1 === s2 && i1.title.toString().toLowerCase() < i2.title.toString().toLowerCase()) ? asc : asc * -1;
  }

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
	}

  toggleSidebar() {
    this.setState({ isSidebarVisible: !this.state.isSidebarVisible });
  }

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		


		const { 
      details,
      parentFranchises,
			releaseDateLowerLimit,
			releaseDateUpperLimit,
			sort,
			titleFilter,
			typeFilter
    } = this.state;
	

		let filteredItems = [];
		if (this.state.details.items) {
			filteredItems = this.state.details.items
				.filter(item => 
					//titleFilter
					item.title.toString().toLowerCase().indexOf(
						titleFilter.toString().toLowerCase()
					) !== -1 &&
					//typeFilter
					extendedEquals(typeFilter, '', item.type) &&
					//releaseDateFilter
					(
						(
							releaseDateLowerLimit === '' || 
							item.releaseDateStatus !== 'Date' ||
							moment(releaseDateLowerLimit).isSameOrBefore(item.releaseDate)
						) &&
						(
							releaseDateUpperLimit === '' || 
							(
								item.releaseDateStatus === 'Date' && 
								moment(releaseDateUpperLimit).isSameOrAfter(item.releaseDate)
							)
						)
					)
				)
				.sort(this.sort);
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
            <Button onClick={this.toggleSidebar}><Icon name='bars' />Filter/Sort</Button>&nbsp;&nbsp;&nbsp;
            <Input name='titleFilter' onKeyPress={this.onTitleFilterChange.bind(this)} icon='search' placeholder='Search...' /><br/><br/>
            <Dropdown placeholder='Add items' clearable={1} loading={!this.state.itemOptionsLoaded} multiple search minCharacters={2} selection options={this.state.itemOptions} onChange={this.handleAddItemsChange.bind(this)} value={this.state.addItems}/>&nbsp;&nbsp;&nbsp;
            <Button onClick={this.addItems.bind(this)}>Add</Button><br/><br/>
            <Sidebar as={Menu}
              animation='overlay'
              onHide={this.hideSidebar.bind(this)}
              vertical
              visible={this.state.isSidebarVisible}
              width='wide'
            >
              <Menu.Item header>Filter By</Menu.Item>
              <Menu.Item>
                <Label>Type</Label>
                <Dropdown placeholder='Type' name='typeFilter' selection value={''}
                  options={[{ text: '---No Filter---', value: '' }, ...typeOptions]}
                  onChange={(param, data) => this.handleValueChange('typeFilter', data.value)} /><br/>
              </Menu.Item>
              <Menu.Item>
                <Label>Release Date Lower Limit</Label>
                <Input type='date' name='releaseDateLowerLimit' value={moment(this.state.releaseDateLowerLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
              </Menu.Item>
              <Menu.Item>
                <Label>Release Date Upper Limit</Label>
                <Input type='date' name='releaseDateUpperLimit' value={moment(this.state.releaseDateUpperLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
              </Menu.Item>
              {
                this.state.typeFilter === 'Movie' &&
                <div>
                  <Menu.Item>
                    <Label>Dvd Release Date Lower Limit</Label>
                    <Input type='date' name='releaseDateDvdLowerLimit' value={moment(this.state.releaseDateDvdLowerLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
                  </Menu.Item>
                  <Menu.Item>
                    <Label>Dvd Release Date Upper Limit</Label>
                    <Input type='date' name='releaseDateDvdUpperLimit' value={moment(this.state.releaseDateDvdUpperLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
                  </Menu.Item>
                </div>
              }
              <Menu.Item header>Sort By</Menu.Item>
              <Menu.Item 
                name='title'
                value='asc'
                active={sort.field === 'title' && sort.order === 'asc'}
                onClick={this.handleSortChange}>
                Title (asc)
              </Menu.Item>
              <Menu.Item 
                name='title'
                value='desc'
                active={sort.field === 'title' && sort.order === 'desc'}
                onClick={this.handleSortChange}>
                Title (desc)
              </Menu.Item>
              <Menu.Item 
                name='releaseDate'
                value='asc'
                active={sort.field === 'releaseDate' && sort.order === 'asc'}
                onClick={this.handleSortChange}>
                Release Date (asc)
              </Menu.Item>
              <Menu.Item 
                name='releaseDate'
                value='desc'
                active={sort.field === 'releaseDate' && sort.order === 'desc'}
                onClick={this.handleSortChange}>
                Release Date (desc)
              </Menu.Item>
              {
                this.state.typeFilter === 'Movie' &&
                <div>
                  <Menu.Item 
                    name='releaseDateDvd'
                    value='asc'
                    active={sort.field === 'releaseDateDvd' && sort.order === 'asc'}
                    onClick={this.handleSortChange}>
                    Dvd Release Date (asc)
                  </Menu.Item>
                  <Menu.Item 
                    name='releaseDateDvd'
                    value='desc'
                    active={sort.field === 'releaseDateDvd' && sort.order === 'desc'}
                    onClick={this.handleSortChange}>
                    Dvd Release Date (desc)
                  </Menu.Item>
                </div>
              }
            </Sidebar>
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
