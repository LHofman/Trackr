export default item => {
    const options = [];
    if (!item || !item.type) return '';
    switch (item.type) {
        case 'Album': options.push('To Listen', 'Listening', 'Listened'); break;
        case 'Book': case 'Comicbook': case 'Manga': options.push('To Read', 'Reading', 'Read'); break;
        case 'Movie': options.push('To Watch', 'Watched'); break;
        case 'TvShow': options.push('To Watch', 'Watching', 'Watched'); break;
        case 'Video Game': options.push('To Play', 'Playing', 'Played', 'Completed'); break;
        case '': return '';
        default: options.push('To Do', 'Doing', 'Done'); break;
    }
    return options.map(option => {
        return {
            text: option, 
            value: option
        }
    });
}