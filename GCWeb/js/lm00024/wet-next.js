/* global $ */
/* Prototype inheritance */
function test() {
  return  {
    a: function() {

    },
    b: function() {

    }
  };
}

var myTest = test.prototype.extension = function() {

};

/* Eric Elliott prototyping inheritance */
var object = {
    a: function() {

    },
    b: function() {

    }
};

var myObject = $.extend({}, object, {
  c: function() {
  }
});

object.a();
object.b();

myObject.a()








( function(window, wb, $) {
  var name= "wb-simple",
      selector = "." + name;

  wb.addPlugin({
    name: name,
    selector: selector,
    defaults: {
      name: "world",
      i18n: {
        "hello": "",
        "goodbye": ""
      }
    },
    _create: function ($elm, settings) {
      $elm.append("Simple plugin: <span class='address'></span>");
      return {
        goodbye: function() {}
      };
    }
  });
});
// wb.callbacks["myCallback"] = function () {}
