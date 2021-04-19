import { ItemType } from '../../types/item/item';
import { Maybe } from '../../types/shared/general';

export default (type: ItemType): Maybe<string> => {
  switch (type) {
    case 'Album': return 'Artist';
    case 'Book': return 'Author';
    case 'Movie': return 'Director';
    case 'TvShow': return 'Creator';
    default: return null;
  }
}