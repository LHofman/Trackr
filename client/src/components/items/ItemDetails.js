import moment from 'moment-timezone';
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Confirm, Dropdown, Icon, Popup, Rating, List, Modal, Radio } from 'semantic-ui-react';

import ItemDetailsFranchise from './ItemDetailsFranchise';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getIcon from '../../utils/getIcon';
import getUser from '../../utils/getUser';
import hasStarted from '../../utils/hasStarted';
import isLoggedIn from '../../utils/isLoggedIn';
import { isFinished, getFinishText, getFinishedText } from '../userItems/finishItem';
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
			newUserItem: '',
			redirect: undefined,
			franchises: [],
			franchiseOptions: [],
			franchiseOptionsLoaded: false,
			addFranchises: [],
			completeItemModal: false,
			timeCompleted: 'now',
			timeCompletedCustom: moment(new Date()).format('YYYY-MM-DD')
		}

		this.cancelComplete = this.cancelComplete.bind(this);
		this.completeItem = this.completeItem.bind(this);
		this.confirmCompletion = this.confirmCompletion.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
		this.removeCompletedHistory = this.removeCompletedHistory.bind(this);
		this.removeFromFranchise = this.removeFromFranchise.bind(this);
		this.updateUserItemValue = this.updateUserItemValue.bind(this);
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
		return fetch(`/api/items/${itemId}`, 'delete', true).then(res => 
			this.setState({redirect: '/'})
		);
	}

	handleValueChange(field, value) {
		this.setState({ [field]: value });
	}

	completeItem(updatedUserItem = undefined) {
		const newUserItem = updatedUserItem || this.state.userItem;

		this.setState({ newUserItem, completeItemModal: true });
	}

	confirmCompletion() {
		const { newUserItem, timeCompleted, timeCompletedCustom } = this.state;

		let date = '';
		switch (timeCompleted) {
			case 'now':
				date = moment(new Date()).format('YYYY-MM-DD');
				break;
			case 'Unknown':
				date = 'Unknown';
				break;
			case 'custom':
				date = moment(timeCompletedCustom).format('YYYY-MM-DD');
				break;
			default: break;
		}

		if ((newUserItem.completedHistory || []).length > 0) {
			newUserItem.completedHistory.push(date);
		} else {
			newUserItem.completedHistory = [date];
		}

		this.updateUserItem(newUserItem);
	}

	cancelComplete() {
		this.setState({ newUserItem: '', completeItemModal: false });
	}

	removeCompletedHistory(dateText) {
		const userItem = this.state.userItem;
		userItem.completedHistory.splice(userItem.completedHistory.indexOf(dateText), 1);
		this.updateUserItem(userItem);
	}

  updateUserItemValue(name, value) {
		let userItem = this.state.userItem;
		if (userItem[name] === value) return;
		
		userItem[name] = value;

		if (
			name === 'status' &&
			isFinished(this.state.details.type, value) &&
			(userItem.completedHistory || []).length === 0
		) {
			this.completeItem(userItem);
			return;
		}
		
		this.updateUserItem(userItem);
	}
	
  updateUserItem(userItem) {
		fetch(`/api/userItems/${userItem._id}`, 'put', true, userItem)
			.catch(res => {
				res.json().then(body => {
					console.log(body);
				});
			});

    this.setState({ userItem, completeItemModal: false });
	}
	
	addFranchises(addFranchises) {
		return fetch(`/api/franchises/addItemToMultiple/${this.state.details._id}`, 'put', true, addFranchises);
	}
	
  removeFromFranchise(franchise) {
    return fetch(`/api/franchises/${franchise._id}/items/remove`, 'put', true, [this.state.details._id]);
  }

	render() {
		const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />
		
		const { details, userItem } = this.state;

		const links = (details.links && details.links.length > 0) ? details.links.map(link => <li key={link.index}>
			<a href={link.url} target='_blank'>{link.title}</a>
		</li>) : undefined;

		let completedHistory = null;
		const completedText = userItem ? getFinishedText(details) : '';
		if (userItem && (userItem.completedHistory || []).length > 0) {
			let times = {};
			completedHistory = (
				<div>
					<p>{ completedText }</p>
					<List bulleted>
						{
							userItem.completedHistory.sort().map((dateText, index, list) => {
								times[dateText] = (times[dateText] || 0) + 1;
								if (list.lastIndexOf(dateText) !== index) return null;
								const timesDate = times[dateText];
								const append = timesDate > 1 ? (' x' + timesDate) : '';
								
								return (
									<List.Item key={ index }>
										{ dateText + append }&nbsp;
										<Icon key='icon' name='trash' color='red' onClick={ () => this.removeCompletedHistory(dateText)} />
									</List.Item>
								)
							})
						}
					</List>
				</div>
			);
		}
				
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
					<div>
						<Checkbox key='inCollection' label='In Collection' name='inCollection' checked={this.state.userItem.inCollection}
							onChange={(param, data) => this.updateUserItemValue('inCollection', data.checked)} /><br /><br />
						<Rating icon='star' defaultRating={this.state.userItem.rating} maxRating={10} clearable onRate={(param, data) => this.updateUserItemValue('rating', data.rating)} /><br/><br/>
						<Dropdown key='status' placeholder='Status' selection options={statusOptions(details)} name='status' value={this.state.userItem.status} 
							onChange={(param, data) => this.updateUserItemValue('status', data.value)} />&nbsp;&nbsp;&nbsp;
						{
							isFinished(details.type, userItem.status) &&
							<Button onClick={ () => this.completeItem() }>{ getFinishText(details) } again</Button>
						}
						<br /><br />
						{ completedHistory }
						<Modal open={ this.state.completeItemModal } onClose={() => this.cancelComplete()}>
							<Modal.Header>{ getFinishText(details) + ' item' }</Modal.Header>
							<Modal.Content>
								<p>When did you { getFinishText(details) } this item?</p>
								<Radio
									label='Now'
									name='timeCompleted'
									value='now'
									checked={ this.state.timeCompleted === 'now' }
									onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
								<Radio
									label={ 'I don\'t remember' }
									name='timeCompleted'
									value='Unknown'
									checked={ this.state.timeCompleted === 'Unknown' }
									onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
								<Radio
									label='Custom Date'
									name='timeCompleted'
									value='custom'
									checked={ this.state.timeCompleted === 'custom' }
									onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
								{
									this.state.timeCompleted === 'custom' &&
									<input
										type='date'
										max={ moment(new Date()).format('YYYY-MM-DD') }
										value={ moment(new Date()).format('YYYY-MM-DD') }
										onChange={ (e) => this.handleValueChange('timeCompletedCustom', e.target.value) } />
								}
								<br/>
								<Modal.Actions>
									<Button color='black' onClick={() => this.cancelComplete()}>Cancel</Button>
									<Button
										content='Continue'
										labelPosition='right'
										icon='checkmark'
										onClick={() => this.confirmCompletion()}
										positive />
								</Modal.Actions>
							</Modal.Content>
						</Modal>
          </div>
        }
				{
          canEdit(details) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/items/${details.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.showConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
				<br/><br/><br/><br/>
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