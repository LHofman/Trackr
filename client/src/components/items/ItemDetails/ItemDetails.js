import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm, Icon, Popup, Grid } from 'semantic-ui-react';

import BackButton from '../../UI/Basic/Button/BackButton';
import ItemDetailsFranchise from './ItemDetailsFranchise';
import ItemDetailsList from './ItemDetailsList';
import LinkedItems from '../../UI/LinkedItems/LinkedItems';
import Reviews from './Reviews';
import UserItemDetails from './UserItemDetails';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import getArtistType from '../getArtistType';
import getIcon from '../../../utils/getIcon';
import getUser from '../../../utils/getUser';
import hasStarted from '../../../utils/hasStarted';
import isLoggedIn from '../../../utils/isLoggedIn';
import statusOptions from '../../userItems/statusOptions';

export default class ItemDetails extends Component {
	constructor(props) {
		super(props);
		this.state = {
			details: '',
			confirmationAlert: '',
			userItem: '',
			redirect: undefined,
			franchises: [],
			franchiseOptions: [],
			franchiseOptionsLoaded: false,
			addFranchises: [],
			isLoaded: false,
			lists: [],
			listOptions: [],
			listOptionsLoaded: false
		}

		this.handleValueChange = this.handleValueChange.bind(this);
		this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
		this.removeFromFranchise = this.removeFromFranchise.bind(this);
		this.removeFromList = this.removeFromList.bind(this);
		this.updateUserItem = this.updateUserItem.bind(this);
	}

  componentWillMount() {
    this.getItem(this.props);
	}
	
	componentWillReceiveProps(props) {
		this.getItem(props);
	}

	getItem(props) {
		let titleId = '';
		if (props.item) {
			titleId = props.item.title_id;
		} else if (props.match) {
			titleId = props.match.params.titleId;
		} else {
			this.setState({ redirect: '/' });
			return;
		}

		return fetch(`/api/items/title_id/${titleId}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({ details })
		}).catch(reason => {
			this.setState({redirect: '/'});
		}).then(() => {
			Promise.all([
				this.getFranchises().then(() => this.getAllFranchises()),
				this.getLists().then(() => this.getAllLists()),
				this.getUserItem()
			]).then(() => {
				this.setState({ isLoaded: true });
			})
		});
	}

	getFranchises() {
		return fetch(`/api/franchises/byItem/${this.state.details._id}`).then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({ franchises });
		});
	}

	getAllFranchises() {
		fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({
				franchiseOptions: 
					franchises.filter(franchise => this.state.franchises.map(franchise => franchise._id).indexOf(franchise._id) === -1)
						.sort((f1, f2) => f1.title.toLowerCase() < f2.title.toLowerCase() ? -1 : 1)
						.map(franchise => { return { key: franchise._id, value: franchise._id, text: franchise.title } }),
				franchiseOptionsLoaded: true
      });
		});
	}

	getLists() {
		return fetch(`/api/lists/byItem/${this.state.details._id}`).then(lists => {
      if (!lists || lists === null) return;
      this.setState({ lists });
		});
	}

	getAllLists() {
		fetch('/api/lists').then(lists => {
      if (!lists || lists === null) return;
      this.setState({
				listOptions: 
					lists.filter(list => this.state.lists.map(list => list._id).indexOf(list._id) === -1)
						.sort((f1, f2) => f1.title.toLowerCase() < f2.title.toLowerCase() ? -1 : 1)
						.map(list => { return { key: list._id, value: list._id, text: list.title } }),
				listOptionsLoaded: true
      });
		});
	}

	getUserItem() {
		if (!isLoggedIn()) return;
		fetch(`/api/userItems/${getUser().id}/${this.state.details._id}`).then(userItem => {
			if (userItem) {
				this.setState({ userItem });
			}
		}).catch(console.log);
	}

  followItem(e) {
    e.preventDefault();
		return fetch(`/api/userItems`, 'post', true, 
			{ 
				user: getUser().id, 
				item: this.state.details._id,
				status: statusOptions(this.state.details)[0].value
			}
		).then(userItem => this.setState({ userItem }))
		.catch(console.log);
  }

  unfollowItem() {
    return fetch(`/api/userItems/${this.state.userItem._id}`, 'delete', true).then(userItem => {
			this.setState({ userItem: ''});
			this.hideConfirmationAlert();
    }).catch(console.log);
  }

  showConfirmationAlert(alert) {
    this.setState({ confirmationAlert: alert });
  }

	hideConfirmationAlert() {
		this.setState({ confirmationAlert: '' });
	}

	confirmAlert() {
		switch (this.state.confirmationAlert) {
			case 'delete': this.onDelete(); break;
			case 'unfollow': this.unfollowItem(); break;
			default: break;
		}
	}

	onDelete() {
		const itemId = this.state.details._id;
		return fetch(`/api/items/${itemId}`, 'delete', true).then(res => {
			if (this.props.deleteItem) this.props.deleteItem(this.state.details);
			this.setState({ redirect: this.props.match });
		});
	}

	handleValueChange(field, value) {
		this.setState({ [field]: value });
	}
	
	addFranchises(addFranchises) {
		return fetch(`/api/franchises/addItemToMultiple/${this.state.details._id}`, 'put', true, addFranchises);
	}
	
	addLists(addLists) {
		return fetch(`/api/lists/addItemToMultiple/${this.state.details._id}`, 'put', true, addLists);
	}
	
  removeFromFranchise(franchise) {
    return fetch(`/api/franchises/${franchise._id}/items/remove`, 'put', true, [this.state.details._id]);
	}
	
  removeFromList(list) {
    return fetch(`/api/lists/${list._id}/items/remove`, 'put', true, [this.state.details._id]);
	}
	
  updateUserItem(userItem) {
		fetch(`/api/userItems/${userItem._id}`, 'put', true, userItem)
			.catch(res => {
				res.json().then(console.log);
			});

    this.setState({ userItem });
	}
	
	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		
		const {
			props: { isSideComponent },
			state: { details, isLoaded, userItem }
		} = this;

		if (!isLoaded) return null;

		const links = (details.links && details.links.length > 0) ? details.links.map(link => <li key={link.index}>
			<a href={link.url} target='_blank'>{link.title}</a>
		</li>) : undefined;

		return (
			<div>
				{ !isSideComponent && <BackButton {...this.props} /> }
				<h1>
					{getIcon(details)}
					{details.title}
					{
						isLoggedIn() &&
						(
							this.state.userItem ?
							<Popup
								trigger={<Icon id='unfollow' name='minus' color='red' onClick={() => this.showConfirmationAlert('unfollow')} />}
								content='Unfollow this item'
							/> :
							<Popup
								trigger={<Icon id='follow' name='plus' color='green' onClick={this.followItem.bind(this)} />}
								content='Follow this item'
							/>
						)
					}
				</h1>
				<Confirm
					open={this.state.confirmationAlert !== ''}
					header={`confirm action`}
					content={`Are you sure you want to ${this.state.confirmationAlert} ${details.title}?`}
					onCancel={this.hideConfirmationAlert.bind(this)}
					onConfirm={this.confirmAlert.bind(this)}
				/>
				{
					getArtistType(details.type) !== null &&
					(
						details.artists.length === 1 ?
							<h3>{getArtistType(details.type)}: {details.artists[0]}</h3> : 
							<h3>{getArtistType(details.type)}s: {details.artists.sort().join(', ')}</h3>
					)
				}
				{
					details.type === 'TvShow' &&
					<h3>{hasStarted(details.releaseDateStatus, details.releaseDate) ? (details.ongoing ? 'Ongoing' : 'Ended') : 'Upcoming'}</h3>
				}
				<h3>
					Release Date: {
						details.releaseDateStatus === 'Date' ? 
						new Date(details.releaseDate).toDateString() : 
						details.releaseDateStatus
					}
				</h3>
				{
					(details.type === 'Movie' && details.releaseDateDvd) &&
					<h3>
						Dvd Release Date: {
							details.releaseDateDvdStatus === 'Date' ? 
							new Date(details.releaseDateDvd).toDateString() : 
							details.releaseDateDvdStatus
						}
					</h3>
				}
				{
					details.type === 'Video Game' &&
					<div>
						{details.platforms.sort().join(', ')}<br/><br/>
						<Button as={Link} to={`/objectives/${details.title_id}`} color='teal'>Objectives</Button><br /><br />
					</div>
				}
				{
					(details.genres && details.genres.length > 0) &&
					<h4>Genres: { details.genres.sort().join(', ') }</h4>
				}
				{
					details.description &&
					<div>
						<br/>
						{details.description}
						<br/><br/><br/>
					</div>
				}
				{
					links &&
					<div>
						<h3>Links</h3>
						<ul>
							{links}
						</ul>
					</div>
				}
				{
					userItem &&
					<UserItemDetails
						item={ details }
						userItem={ userItem }
						updateUserItem={ this.updateUserItem }
						onChangeStatus={ this.props.onChangeStatus || null } />
        }
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/items/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
				<br/><br/><br/><br/>
				<Grid>
          <Grid.Column width={ this.props.item ? 8 : 6 }>
						<LinkedItems
							title='In Franchises'
							options={ this.state.franchiseOptions }
							optionsLoaded={ this.state.franchiseOptionsLoaded }
							items={ this.state.franchises }
							createItemComponent={ createFranchiseItemComponent(this.state.details) }
							removeItem={ this.removeFromFranchise }
							addItems={ this.addFranchises.bind(this) }
							parentComponent={ this }
							stateKeyItems='franchises'
							stateKeyOptions='franchiseOptions'
							placeholder='Add to franchises' />
						<br/><br/>
						<LinkedItems
							title='In My Lists'
							options={ this.state.listOptions }
							optionsLoaded={ this.state.listOptionsLoaded }
							items={ this.state.lists }
							createItemComponent={ createListItemComponent(this.state.details) }
							removeItem={ this.removeFromList }
							addItems={ this.addLists.bind(this) }
							parentComponent={ this }
							stateKeyItems='lists'
							stateKeyOptions='listOptions'
							placeholder='Add to lists' />
					</Grid.Column>
					<Grid.Column width={ this.props.item ? 8 : 10 }>
						<Reviews
							allReviews={ this.state.allReviews }
							item={ this.state.details }
							userItem={ this.state.userItem }
							updateUserItem={ this.updateUserItem }/>
					</Grid.Column>
				</Grid>
				<br/>
      </div>
    );
  }
}

const createFranchiseItemComponent = (details) => (onDelete) => (franchise) => {
  return (
		<ItemDetailsFranchise
			key={ franchise._id }
			item={ details }
			franchise={ franchise }
			onDelete={ onDelete } />
	)
}

const createListItemComponent = (details) => (onDelete) => (list) => {
  return (
		<ItemDetailsList
			key={ list._id }
			item={ details }
			list={ list }
			onDelete={ onDelete } />
	)
}