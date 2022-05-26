async function getFullMovieList(idList) {
    let promises = []
    for (let id of idList) {
        // console.log(movie)
        promises.push(fetch(`https://www.omdbapi.com/?i=${id}&apikey=4bb5431b`)
            .then(res => res.json()))
    }

    return await Promise.all(promises).then(data => data)
}

function getIdFromBtnId(btnId) {
    const index = btnId.indexOf('-')
    if (index == -1 && index + 1 > btnId.length) return btnId
    return btnId.substr(index + 1)
}

function getImgPlaceholderHtml() {
    return `
    <div class="movie-img-placeholder">
        <i class="fa-solid fa-film fa-3x" id="placeholder-img"></i>
    </div>
    `
}

export { getFullMovieList, getIdFromBtnId, getImgPlaceholderHtml }