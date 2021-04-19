import { ReactElement } from 'react';
import { Icon } from 'semantic-ui-react';

import { Item } from '../types/item/item';

export default (item: Item): ReactElement => {
    let name:  'book' | 'game' | 'inbox' | 'music' |'video';

    switch (item.type) {
        case 'Album': name = 'music'; break;
        case 'Book': case 'Comicbook': case 'Manga': name = 'book'; break;
        case 'Movie': case 'TvShow': name = 'video'; break;
        case 'Video Game': name = 'game'; break;
        default: name = 'inbox'; break;
    }

    return <Icon name={name} />
}