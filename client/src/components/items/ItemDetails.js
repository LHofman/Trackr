import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Confirm, Dropdown, Icon, Popup, Rating } from 'semantic-ui-react';

import ItemDetailsFranchise from './ItemDetailsFranchise';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getIcon from '../../utils/getIcon';
import getUser from '../../utils/getUser';
import hasStarted from '../../utils/hasStarted';
import isLoggedIn from '../../utils/isLoggedIn';
import statusOptions from '../userItems/statusOptions';
import getArtistType from './getArtistType';
import LinkedItems from '../UI/LinkedItems/LinkedItems';

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
			addFranchises: []
		}

		this.updateUserItem = this.updateUserItem.bind(this);
		this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
		this.removeFromFranchise = this.removeFromFranchise.bind(this);
	}

  componentWillMount() {
    this.getItem();
  }

	getItem() {
		const title_id = this.props.match.params.titleId;
		return fetch(`/api/items/title_id/${title_id}`).then(details => {
			if (!details || details === null) throw new Error('item not found');
			this.setState({ details })
		}).catch(reason => {
			this.setState({redirect: '/'});
		}).then(() => {
			this.getFranchises().then(() => this.getAllFranchises());
			this.getUserItem();
		});
	}

	getUserItem() {
		if (!isLoggedIn()) return;
		fetch(`/api/userItems/${getUser().id}/${this.state.details._id}`).then(userItem => {
			if (userItem) {
				this.setState({userItem});
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
		return fetch(`/api/items/${itemId}`, 'delete', true).then(res => 
			this.setState({redirect: '/'})
		);
	}

  updateUserItem(name, value) {
		const userItem = this.state.userItem;
    if (userItem[name] === value) return;
    userItem[name] = value;
		fetch(`/api/userItems/${userItem._id}`, 'put', true, userItem)
			.catch(res => {
				res.json().then(body => {
					console.log(body);
				});
			});
    this.setState({ userItem });
	}
	
	getFranchises() {
		return fetch(`/api/franchises/byItem/${this.state.details._id}`).then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({ franchises });
		});
	}

  removeFromFranchise(franchise) {
    return fetch(`/api/franchises/${franchise._id}/items/remove`, 'put', true, [this.state.details._id]);
  }

	addFranchises(addFranchises) {
		return fetch(`/api/franchises/addItemToMultiple/${this.state.details._id}`, 'put', true, addFranchises);
	}
	
	getAllFranchises() {
		fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) return;
      this.setState({ franchiseOptions: 
        franchises.filter(franchise => this.state.franchises.map(franchise => franchise._id).indexOf(franchise._id) === -1)
					.sort((f1, f2) => f1.title.toLowerCase() < f2.title.toLowerCase() ? -1 : 1)
        	.map(franchise => { return { key: franchise._id, value: franchise._id, text: franchise.title } })
      });
		});
	}

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		
		const details = this.state.details;

		const links = (details.links && details.links.length > 0) ? details.links.map(link => <li key={link.index}>
			<a href={link.url} target='_blank'>{link.title}</a>
		</li>) : undefined;
				
		return (
			<div>
				<Button labelPosition='left' icon='left chevron' content='Back' as={Link} to={'/'} />
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
				<br />
				{
					details.type === 'Video Game' &&
					<div>
						{details.platforms.sort().join(', ')}<br/><br/>
						<Button as={Link} to={`/objectives/${details.title_id}`} color='teal'>Objectives</Button><br /><br />
					</div>
				}
				{
					details.description &&
					<div>
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
					this.state.userItem &&
					<div>
						<Checkbox key='inCollection' label='In Collection' name='inCollection' checked={this.state.userItem.inCollection}
							onChange={(param, data) => this.updateUserItem('inCollection', data.checked)} /><br /><br />
						<Rating icon='star' defaultRating={this.state.userItem.rating} maxRating={10} clearable onRate={(param, data) => this.updateUserItem('rating', data.rating)} /><br/><br/>
						<Dropdown key='status' placeholder='Status' selection options={statusOptions(details)} name='status' value={this.state.userItem.status} 
							onChange={(param, data) => this.updateUserItem('status', data.value)} /><br /><br />
          </div>
        }
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/items/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert('delete')}>Delete</Button>	
          ]
				}<br/><br/>
				<LinkedItems
					title='In Franchises'
					options={ this.state.franchiseOptions }
					items={ this.state.franchises }
					createItemComponent={ createFranchiseItemComponent(this.state.details) }
					removeItem={ this.removeFromFranchise }
					addItems={ this.addFranchises.bind(this) }
					parentComponent={ this }
					stateKeyItems='franchises'
					stateKeyOptions='franchiseOptions'
					placeholder='Add to franchises' />
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