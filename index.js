import {getFullMovieList, getIdFromBtnId} from './utils.js';

const searchForm = document.getElementById('search-form')
const searchBar = document.getElementById('search-bar')
const resultsListDiv = document.getElementById('movies-list')
const placeholder = document.getElementById('results-placeholder')
const message = document.getElementById('results-message')

const watchList = JSON.parse(localStorage.getItem('watchlist'))
if (!watchList) watchList = []

let page = 1

searchForm.addEventListener('submit', (e) => {
    // alert('Search btn pressed')
    e.preventDefault()
    const searchTxt = searchBar.value
    resultsListDiv.innerHTML = ''
    if (searchTxt.length === 0) {
        setMode(0)
    } else {
        // console.log(searchTxt)
        fetch(`https://www.omdbapi.com/?i=tt1285016&apikey=4bb5431b&s=${searchTxt}&page=${page}`)
            .then(res => res.json())
            .then(data => {
                // console.log(data.Search)
                if (!data.Search) {
                    setMode(-1)
                } else {
                    loadResults(data.Search)
                }
            })
    }
})

function setMode(mode) {
    if (mode === 0) {
        placeholder.classList.remove('hide')
        message.classList.add('hide')
    } else if (mode === 1) {
        placeholder.classList.add('hide')
        message.classList.add('hide')
    } else if (mode === -1) {
        placeholder.classList.add('hide')
        message.classList.remove('hide')
    }
}

async function loadResults(moviesList) {
    setMode(1)

    let idList = moviesList.map(x => x.imdbID)
    const fullMovieList = await getFullMovieList(idList)

    const btnIdList = []
    const html = fullMovieList.map(movie => {
        btnIdList.push(movie.imdbID)
        const inWatchlist = movieInWatchlist(movie.imdbID)
        return getMovieHTML(movie, inWatchlist)
    }).join('')
    resultsListDiv.innerHTML = html

    btnIdList.map(id => addBtnListeners(id))
}

function movieInWatchlist(movieId) {
    return watchList.includes(movieId)
}

function getMovieHTML(movie, inWatchlist) {
    return `
    <div class="movie">
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
            <button class="movie-btn ${inWatchlist ? 'hide' : ''}" id="watch-${movie.imdbID}">
                <i class="fas fa-circle-plus"></i> Watchlist
            </button>
            <button class="movie-btn ${!inWatchlist ? 'hide' : ''}" id="remove-${movie.imdbID}">
                <i class="fas fa-circle-minus"></i> Remove
            </button>
            <p>${movie.Plot}</p>
        </div>
    </div>
    `
}

function addBtnListeners(id) {
    const addBtn = document.getElementById('watch-' + id)
    addBtn.addEventListener('click', addToWatchlist)

    const removeBtn = document.getElementById('remove-' + id)
    removeBtn.addEventListener('click', removeFromWatchlist)
}

function addToWatchlist(event) {
    const btnId = event.currentTarget.id
    const id = getIdFromBtnId(btnId)

    if (watchList.indexOf(id) == -1) {
        watchList.push(id)
        localStorage.setItem('watchlist', JSON.stringify(watchList))
    }

    event.currentTarget.classList.add('hide')
    document.getElementById('remove-' + id).classList.remove('hide')
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

    event.currentTarget.classList.add('hide')
    document.getElementById('watch-' + id).classList.remove('hide')
}