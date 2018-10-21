import moment from 'moment-timezone';
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Form, Message, TextArea } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import typeOptions from './typeOptions';

export default class EditItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      details: {},
      id: '',
      type: '',
      title: '',
      titleError: '',
      releaseDate: '',
      releaseDateError: '',
      description: undefined,
      author: '',
      authorError: '',
      ongoing: false,
      redirect: undefined
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentWillMount() {
    this.getItemDetails();
  }

  getItemDetails() {
    const title_id = this.props.match.params.titleId;
    return fetch(`/api/items/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({
            details,
            id: details._id,
            type: details.type,
            title: details.title,
            description: details.description,
            releaseDate: details.releaseDate
          });
          switch (details.type) {
            case 'Book': this.setState({ author: details.author }); break;
            case 'TvShow': this.setState({ ongoing: details.ongoing }); break;
            default:
          }
        } else this.setState({ redirect: `/items/${title_id}` });
			}).catch(reason => 
				this.setState({redirect: '/'})
			);
  }

  editItem(newItem) {
    const itemId = this.state.id;
    return fetch(`/api/items/${itemId}`, 'put', true, newItem).then(item => {
        this.setState({redirect: `/items/${item.title_id}`});
      }).catch(console.log);
  }

  checkForErrors() {
    let isError = false;
    const errors = {};

    if (!this.state.title) {
      isError = true;
      errors.titleError = 'Title is required';
    } else {
      errors.titleError = '';
    }

    if (this.state.releaseDate === '') {
      isError = true;
      errors.releaseDateError = 'ReleaseDate is required';
    } else {
      errors.releaseDateError = '';
    }

    if (this.state.type === 'Book' && !this.state.author) {
      isError = true;
      errors.authorError = 'Author is required';
    } else {
      errors.authorError = '';
    }

    if (isError) {
      this.setState({
        ...this.state,
        ...errors
      });
    }

    return isError;
  }

  handleSubmit(e) {
    e.preventDefault();
    const err = this.checkForErrors();
    if (err) return;
    const { type, title, releaseDate, description } = this.state;
    const newItem = {
      type,
      title,
      releaseDate: new Date(releaseDate).toISOString(),
      description
    }
    switch (type) {
      case 'Book': newItem.author = this.state.author; break;
      case 'TvShow': newItem.ongoing = this.state.ongoing; break;
      default:
    }
    this.editItem(newItem);
  }

  handleInputChange(e) {
    const target = e.target;
    this.handleValueChange(target.name, target.value);
  }

  handleValueChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />



    return (
      <div>
        <h1>Edit Item</h1>
        <Form error onSubmit={this.handleSubmit.bind(this)}>
          <Form.Field>
            <label>Type</label>
            <Dropdown placeholder='Type' fluid selection options={typeOptions} name='type' value={this.state.type} onChange={(param, data) => this.handleValueChange('type', data.value)} />
          </Form.Field>
          <Form.Field>
            <label>Title</label>
            <input placeholder='Title' name='title' value={this.state.title} onChange={this.handleInputChange} />
            {
							this.state.titleError && 
              <Message error header={this.state.titleError} />
            }
          </Form.Field>
          {
						this.state.type === 'Book' &&
            <Form.Field>
              <label>Author</label>
              <input placeholder='Author' name='author' value={this.state.author} onChange={this.handleInputChange} />
              {
								this.state.authorError &&
                <Message error header={this.state.authorError} />
              }
            </Form.Field>
          }
          <Form.Field>
            <label>Release Date</label>
            <input type='date' name='releaseDate' value={moment(this.state.releaseDate).format('YYYY-MM-DD')} onChange={this.handleInputChange} />
            {
							this.state.releaseDateError && 
              <Message error header={this.state.releaseDateError} />
            }
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <TextArea autoHeight placeholder='Description' name='description' value={this.state.description} onChange={this.handleInputChange} />
          </Form.Field>
          {
						this.state.type === 'TvShow' &&
            <Form.Field>
              <Checkbox label='Ongoing' name='ongoing' checked={this.state.ongoing} onChange={(param, data) => this.handleValueChange('ongoing', data.checked)} />
            </Form.Field>
          }
          <Button positive floated='left' type='submit'>Save Item</Button>
          <Button negative floated='right' as={Link} to={`/items/${this.state.id}`}>Cancel</Button>
        </Form>
      </div>
    );
  }
}
