export function handleSortByOrder(studies, sortBy) {
        return [...studies].sort((a, b) => {
            switch (sortBy) {
                case 'year_asc':
                    return (a.year - b.year);
                case 'year_des':
                    return (b.year - a.year);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_des':
                    return b.title.localeCompare(a.title);
                case 'author_asc':
                    return a.authors.localeCompare(b.authors);
                case 'author_des':
                    return b.authors.localeCompare(a.authors);
                case 'index_asc':
                    return a.id.localeCompare(b.id)
                case 'probability_asc':
                    return 0;
                case 'probability_des':
                    return 0;
                default:
                    return 0;
            }
        });
    }