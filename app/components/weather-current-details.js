export default Ember.Component.extend({

  displayDate: function () {
    return moment.unix(this.get('weather.weatherForecast.currently.time')).format('MMM DD');
  }.property('weather.weatherForecast.currently.time')


});
