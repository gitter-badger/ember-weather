var request = require('request')
  , RSVP = require('rsvp')
  , get = RSVP.denodeify(request.get)
  , apiKeys = require('./api-keys')
  , Lazy = require('lazy.js')
  , logger = require('./logger')().logger

function getSearch(query, opts) {
  var query = query.split('-').join(', ')
    , wundergroundQueryUrl = 'http://autocomplete.wunderground.com/aq?query=' + query
    , limit = (opts && opts.limit) || 1

  return timedGet(wundergroundQueryUrl).then(function(response) {
    var results = JSON.parse(response[1]).RESULTS
    return Lazy(results).filter({'type': 'city'}).take(limit).toArray()
  })
}

function fetchPayload(searchResults) {
  var result = searchResults[0]
    , lField = result.l
    , latField = result.lat
    , lonField = result.lon
    , nameField = result.name

  return RSVP.hash({
    weatherConditions: asJSON(timedGet(buildWeatherUrl('conditions', latField, lonField))),
    weatherForecast: asJSON(timedGet(buildWeatherUrl('forecast10day', latField, lonField))),
    imageApi: asJSON(timedGet(build500pxUrl(nameField))),
    locationName: nameField
  })

  function buildWeatherUrl (type, lField) {
    return 'https://api.forecast.io/forecast/a56a0dc4d7e2785dcb499e94ef9deb2f/' +
        latField + ',' + lonField
  }

  function build500pxUrl (nameField) {
    var rand = Math.floor((Math.random()*5)+1)
    return 'https://api.500px.com/v1/photos/search?term=' +
           nameField +
           '&only=landscapes&sort=favorites_count&rpp=1&page='+rand+'&consumer_key=' +
           apiKeys.fiveHundredPX
  }

  function asJSON (responsePromise) {
    return responsePromise.then(function (response) {
      return JSON.parse(response[0].body)
    })
  }
}

function timedGet(url) {
  var beforeGetTS = Date.now()
  return get(url).then(function (r) {
    logger.info("Request to " + url + " took " + (Date.now() - beforeGetTS) + " ms ")
    return r
  })
}

function handleError(e) {
  logger.info("there was an error", e)
}

module.exports = function(app) {
  app.get('/api/weather/:location', function (req, res) {
    getSearch(req.params.location)
    .then(fetchPayload)
    .then(res.send.bind(res))
    .catch(handleError)
  })

  app.get('/api/search/:term', function (req, res) {
    getSearch(req.params.term, {limit: 5})
    .then(res.send.bind(res))
    .catch(handleError)
  })

}
