import React, { Component } from 'react';
import { Button, Form, Icon, Message } from 'semantic-ui-react';

import createFieldsFromConfig from '../createFieldsFromConfig';
import { updateNestedValue } from '../../../../utils/objectUtils';

export default class Links extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: this.props.links,
      inputs: {
        newLinkTitle: {
          placeholder: 'Title',
          width: 3,
          value: '',
          hideLabel: true,
          isRequired: true
        },
        newLinkUrl: {
          placeholder: 'Url',
          width: 7,
          value: '',
          hideLabel: true,
          isRequired: true
        }
      },
      newLinkError: ''
    }

    this.handleValueChange = this.handleValueChange.bind(this);
  }

  addLink() {
    const title = this.state.inputs.newLinkTitle.value;
    const url = this.state.inputs.newLinkUrl.value;

    if (!title || !url) {
      this.setState({ newLinkError: 'Please enter a title and url' });
      return;
    }

    const links = [...this.state.links, { title, url, index: this.state.links.length }];
    
    let updatedForm = updateNestedValue(this.state.inputs, 'newLinkTitle.value', '');
    updatedForm = updateNestedValue(updatedForm, 'newLinkUrl.value', '');

    this.setState({
      links,
      inputs: updatedForm,
      newLinkError: ''
    });
    this.props.handleValueChange('links.value', links);
  }

  handleValueChange(field, value) {
    const updatedForm = updateNestedValue(this.state.inputs, field, value);
    this.setState({ inputs: updatedForm });
  }

  removeLink(e, data) {
    const index = parseInt(data.name.substring(5), 10);
    let found = false;
    const links = [];

    for (let i = 0; i < this.state.links.length; i++) {
      let link = this.state.links[i];
      if (link.index === index) {
        found = true;
        continue;
      }
      if (found) {
        link.index--;
      }
      links.push(link);
    }

    this.setState( { links });
    this.props.handleValueChange('links.value', links);
  }

  render() {
    const links = this.state.links.map(link =>
      <Form.Group key={link.index}>
        <Form.Field width={3}>
          <input disabled value={link.title}/>
        </Form.Field>
        <Form.Field width={7}>
          <input disabled value={link.url}/>
        </Form.Field>
        <Form.Field>
          <Button
            type='button'
            animated
            color='orange'
            name={`link_${link.index}`}
            onClick={ this.removeLink.bind(this) }>
            <Button.Content visible>Remove Link</Button.Content>
            <Button.Content hidden>
              <Icon name='arrow down' />
            </Button.Content>
          </Button>
        </Form.Field>
      </Form.Group>
    );

    const formFields = createFieldsFromConfig(this, this.handleValueChange.bind(this));

    return (
      <div>
        <Form.Field><label>Links</label></Form.Field>
        {links}
        <Form.Group>
          { formFields }
          <Form.Field>
            <Button type='button' onClick={this.addLink.bind(this)} animated>
              <Button.Content visible>Add Link</Button.Content>
              <Button.Content hidden>
                <Icon name='arrow up' />
              </Button.Content>
            </Button>
          </Form.Field>
        </Form.Group>
        {
          this.state.newLinkError &&
          <Message error header={this.state.newLinkError} />
        }
      </div>
    );
  }
}