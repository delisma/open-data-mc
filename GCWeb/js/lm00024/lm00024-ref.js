/* global $, document, d3 */
var state = {
  data: [
    {
      color: "blue",
      description: "",
      value: 0
    },
    {
      color: "yellow",
      description: "",
      value: 0
    }
  ],
  chartH2: "",
  chartH3: "",
  wbtablesCaption: "",
  chartDesc: "",
  label: "",
  ctrlId: "",
  formgroup: "",
  slct: ""
};
//var sCompliance = ()
/*function intVal(i) {
  "use strict";
  return typeof i === "string" ? i.replace(/[,]/g, '') * 1 : typeof i === "number" ? i : 0;
};
var sumIntVal = function (a, b) {
  "use strict";
  return intVal(a) + intVal(b);
};
var graphData = function () {
  "use strict";
  var columnPercentage = function (a, b) {
	return api.column(a, {
	  page: "current"
	}).data().reduce(sumIntVal, 0) / api.column(b, {
	  page: "current"
	}).data().reduce(sumIntVal, 0);
  };
  return {
	accurate: columnPercentage(4, 3),
	inaccurate: columnPercentage(5, 3)
  };
};
function appendSelect(d, elm) {
  "use strict";
  var optVal = $.parseHTML(d);
  if (elm.attr("id") === "provinces" && elm.children().length === 0) {
	elm.append('<option value="">' + sARegion + '</option>');
  }
  elm.append('<option value="' + $(optVal).text() + ' ">' + $(optVal).text() + '</option>');
};
*/
function initUI() {
  "use strict";
  
  // Initiating dropdown lists
  api.columns(".select-filter").every(function () {
    state.label = $(this.header()).text();
    state.ctrlId = state.label.substr(0, state.label.indexOf(" ")) ? state.label.substr(0, state.label.indexOf(" ")).toLowerCase() : state.label.toLowerCase();
	state.formgroup = $('<div class="form-group"><label class="control-label" for="' + state.ctrlId + '">' + state.label + '</label></div>');
	state.slct = $('<select id="' + state.ctrlId + '" name="' + state.ctrlId + '" class="form-control"></select>')

	this.data().unique().sort().each(function (val) {
		appendSelect(val, state.slct);
	});
	state.slct.appendTo(state.formgroup);
	selectFilter(this);
	$("#years option:last").attr("selected", "selected");
	$("#filter").append(state.formgroup);
  });
  
  // Display data from current year and appropriate sector
  api.search($("#trade").val().trim() + " " + $("#years").val().trim()).draw();

  // Summing up the data in the footer
  //sumFooter();
};

function updateUI() {
  "use strict";

  // Update footer
  api.columns($(":not(.select-filter)"), {
	page: "current"
  }).every(function () {
	var sum = this.columns(this.index(), {
	  page: "current"
	}).data()[0].reduce(sumIntVal, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sSep);
	$(this.footer()).html(sum);
  });
  
  // State machine
  $(".chart h2").html(state.chartH2);
  $(".chart h3").html(state.chartH3);
  $(".wb-tables caption").html(state.wbtablesCaption);
  $(".chart--desc").html(state.chartDesc);
}

$("#trade").on("change", function () {
  // state changes here
  state.chartH2 = this.value;
  state.wbtablesCaption = sCompliance + " (" + this.value + " " + $("#year").val().trim();
  updateUI()
});
$("#year").on("change", function () {
  // state changes here
  state.chartH3 = $("#province").val().trim() + " (" + this.value + ")";
  state.wbtablesCaption = sCompliance + " (" + $("#trade").val().trim() + " " + this.value + ")";
  updateUI()
});
$("#province").on("change", function () {
  // state changes here
  state.chartH3 = this.value + " (" + $("#year").val().trim() + ")"
  updateUI()
});

$(document).ready(function () {
  "use strict";
  api = $(".wb-tables").dataTable().api();
  initUI();
  state.chartH2 = $("#trade option:selected").val().trim();
  state.chartH3 = sARegion + " (" + $("#years option:selected").val().trim() + ")";
  state.wbtablesCaption = sCompliance + " (" + $("#trade option:selected").val().trim() + " " + $("#years option:selected").val().trim() + ")";
  state.chartDesc = sTradeDesc[$("#trade option:selected").val().trim()];
  //initChart(graphData().accurate, graphData().inaccurate);
  updateUI()
});

