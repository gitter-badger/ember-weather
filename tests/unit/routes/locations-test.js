import { test, moduleFor } from 'ember-qunit';

import Locations from 'ember-weather/routes/locations';

moduleFor('route:locations', "Unit - LocationsRoute");

test("it exists", function(){
  var route = this.subject();
  ok(route);
  ok(route instanceof Locations);
});
