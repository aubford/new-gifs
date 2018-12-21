const giphyApiKey = '7PWWqSKFhCVBeKfFwFAbeSF1QojUl177'

const headers = new Headers({
  'Content-Type': 'application/json'
})

export const getGif = () =>
  fetch(`http://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}`, {
    method: 'get',
    headers
  })
