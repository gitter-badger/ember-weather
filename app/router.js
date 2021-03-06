import Ember from 'ember';

var Router = Ember.Router.extend({
  location: EmberWeatherENV.locationType
});

Router.map(function() {
  this.resource("locations", {path: 'locations'}, function(){
    this.resource("weather", {path: ':location_id'}, function(){});
  });
});

export default Router;
