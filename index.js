import { getFullMovieList, getIdFromBtnId, imgError } from './utils.js';

const searchForm = document.getElementById('search-form')
const searchBar = document.getElementById('search-bar')
const resultsListDiv = document.getElementById('movies-list')
const placeholder = document.getElementById('results-placeholder')
const message = document.getElementById('results-message')
const first = document.getElementById('firstBtn')
const last = document.getElementById('lastBtn')
const prev = document.getElementById('prevBtn')
const next = document.getElementById('nextBtn')
const arrows = document.getElementById('arrows')
const currentPage = document.getElementById('current-page')

let watchList = JSON.parse(localStorage.getItem('watchlist'))
if (!watchList) watchList = []

let currentPageVal = 1
let maxPages = 0

searchForm.addEventListener('submit', (e) => {
    e.preventDefault()
    currentPageVal = 1
    maxPages = 0
    loadPage()  
})

function loadPage() {
    const searchTxt = searchBar.value.trim()
    resultsListDiv.innerHTML = ''
    if (searchTxt.length === 0) {
        setMode(0)
    } else {
        fetch(`https://www.omdbapi.com/?i=tt1285016&apikey=4bb5431b&s=${searchTxt}&page=${currentPageVal}`)
            .then(res => res.json())
            .then(data => {
                if (!data.Search) {
                    setMode(-1)
                } else {
                    if (maxPages === 0) setMaxPages(data.totalResults)
                    loadResults(data.Search)
                }
            })
    }
}

function setMaxPages(total) {
    maxPages = Math.ceil(total/10)
}

function setMode(mode) {
    if (mode === 0) {
        placeholder.classList.remove('hide')
        message.classList.add('hide')
        arrows.classList.add('hide')
    } else if (mode === 1) {
        placeholder.classList.add('hide')
        message.classList.add('hide')
        arrows.classList.remove('hide')
    } else if (mode === -1) {
        placeholder.classList.add('hide')
        message.classList.remove('hide')
        arrows.classList.add('hide')
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
    updatePages()

    btnIdList.map(id => addListeners(id))
}

function movieInWatchlist(movieId) {
    return watchList.includes(movieId)
}

function getMovieHTML(movie, inWatchlist) {
    return `
    <div class="movie">
        <div class="column">
            <img id="img-${movie.imdbID}" src="${movie.Poster}" alt="Poster for ${movie.Title}">
        </div>
        <div class="column">
            <div class="movie-top">
                <h2>${movie.Title}</h2>
                <span>${movie.imdbRating} <i class="fa-solid fa-star star"></i></span>
            </div>

            <span class="movie-info">${movie.Runtime}</span>
            <span class="movie-info">${movie.Genre}</span>
            <button class="btn ${inWatchlist ? 'hide' : ''}" id="watch-${movie.imdbID}">
                <i class="fas fa-circle-plus"></i> Watchlist
            </button>
            <button class="btn ${!inWatchlist ? 'hide' : ''}" id="remove-${movie.imdbID}">
                <i class="fas fa-circle-minus"></i> Remove
            </button>
            <p>${getFormattedPlot(movie.Plot)}</p>
        </div>
    </div>
    `
}

function getFormattedPlot(plot) {
    //leave it alone if N/A or ends in a period
    if (plot !== 'N/A' && 
        plot.charAt(plot.length - 1) !== '.') {
        plot += '...'
    }
    return plot
}

function updatePages() {
    currentPage.textContent = currentPageVal
    if (currentPageVal === 1) {
        first.classList.add('invisible')
        prev.classList.add('invisible')
        next.classList.remove('invisible')
        last.classList.remove('invisible')
    } else if (currentPageVal === maxPages) {
        first.classList.remove('invisible')
        prev.classList.remove('invisible')
        next.classList.add('invisible')
        last.classList.add('invisible')
    } else {
        first.classList.remove('invisible')
        prev.classList.remove('invisible')
        next.classList.remove('invisible')
        last.classList.remove('invisible')
    }
}

function addListeners(id) {
    const addBtn = document.getElementById('watch-' + id)
    addBtn.addEventListener('click', addToWatchlist)

    const removeBtn = document.getElementById('remove-' + id)
    removeBtn.addEventListener('click', removeFromWatchlist)

    const img = document.getElementById('img-' + id)
    img.addEventListener('error', imgError)
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

first.addEventListener('click', () => {
    currentPageVal = 1
    loadPage()
})
prev.addEventListener('click', () => {
    currentPageVal--
    loadPage()
})
next.addEventListener('click', () => {
    currentPageVal++
    loadPage()
})
last.addEventListener('click', () => {
    currentPageVal = maxPages
    loadPage()
})