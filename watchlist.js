import { getFullMovieList, getIdFromBtnId, getImgPlaceholderHtml } from './utils.js';

const resultsListDiv = document.getElementById('movies-list')
const message = document.getElementById('results-message')

const watchList = JSON.parse(localStorage.getItem('watchlist'))
if (!watchList) watchList = []

loadWatchlist()

async function loadWatchlist() {
    console.log(watchList)
    if (!watchList) {
        hideMessage(false)
        return
    }
    hideMessage(true)

    const fullMovieList = await getFullMovieList(watchList)

    const html = fullMovieList.map(movie => {
        return getMovieHTML(movie)
    }).join('')
    resultsListDiv.innerHTML = html

    watchList.map(id => addBtnListener(id))
}

function hideMessage(hide) {
    hide ?
        message.classList.add('hide') : 
        message.classList.remove('hide')
}

function getMovieHTML(movie) {
    return `
    <div class="movie" id="movie-${movie.imdbID}">
        <div class="column">
            <img src="${movie.Poster}" alt="Poster for ${movie.Title}">
        </div>
        <div class="column">
            <div class="movie-top">
                <h2>${movie.Title}</h2>
                <span>${movie.imdbRating} <i class="fa-solid fa-star star"></i></span>
            </div>

            <span class="movie-info">${movie.Runtime}</span>
            <span class="movie-info">${movie.Genre}</span>
            <button class="btn" id="remove-${movie.imdbID}">
                <i class="fas fa-circle-minus"></i> Remove
            </button>
            <p>${movie.Plot}</p>
        </div>
    </div>
    `
}

function addBtnListener(id) {
    const removeBtn = document.getElementById('remove-' + id)
    removeBtn.addEventListener('click', removeFromWatchlist)
}

function removeFromWatchlist(event) {
    const btnId = event.currentTarget.id
    const id = getIdFromBtnId(btnId)

    if (watchList) {
        const index = watchList.indexOf(id)
        if (index > -1)
            watchList.splice(index, 1)
        localStorage.setItem('watchlist', JSON.stringify(watchList))
    }

    document.getElementById('movie-' + id).remove()
}