/* global $, document, d3, window, api */
/**
 * @title WET-BOEW D3 graph
 * @overview Integrates the D3 WET providing a librairy for manipulating documents based on data.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @jeresiv
 */
/*jshint scripturl:true*/
$(document).on("wb-ready.wb", function(event) {
	"use strict";
	var api;
	var svgHeight;
	var msgHeight;
	var $trade;
	var $year;
	var $region;

	// the state machine
	var state = {
		lang: document.documentElement.lang,
		en: {
			filterh2: "Filtering Options",
			filterh3: "Filter your search results",
			filtertxt: "Use the filters below to narrow your search results.",
			tradeLabel: "Trade sector",
			yearLabel: "Year",
			provinceLabel: "Province/territory",
			filtersubmitbutton: "Filter",
			filterclearbutton: "Clear",
			sep: ",",
			aRegion: "National",
			region: "",
			sector: "",
			compliance: "Compliance data",
			footnote: "Only data for gas and diesel pumps are displayed",
			tradeDesc: {
				"Retail food": "The retail food sector includes the sale of foods at grocery stores, markets, specialty stores, coffee retailers, deli and butcher shops, etc.  The most common measuring devices in this sector are scales.",
				"Retail petroleum": "The retail petroleum sector includes the sale of liquid refined petroleum products (e.g. gasoline, diesel, propane) and liquid alternative fuels (e.g. hydrogen, ethanol) at gas stations, marinas and truck refuelling stations, etc. The most common devices in this sector are fuel pumps and propane meters."
			},
			bDesc: "measuring accurately",
			yDesc: "measuring inaccurately",
			errMsg: "No inspections were performed in "
		},
		fr: {
			filterh2: "Précisez les résultats de votre recherche",
			filterh3: "Précisez les résultats de votre recherche",
			filtertxt: "Utilisez les filtres ci-dessous pour affiner les résultats de la recherche.",
			tradeLabel: "Secteur commercial",
			yearLabel: "Année",
			provinceLabel: "Province/territoire",
			filtersubmitbutton: "Filtrer",
			filterclearbutton: "Effacer",
			sep: " ",
			aRegion: "National",
			region: "",
			sector: "",
			compliance: "Données de conformité",
			tradeDesc: {
				"Aliments au détail": "Le secteur des aliments au détail comprend la vente d'aliments dans les épiceries, les marchés, les magasins spécialisés, les détaillants de café, les charcuteries et les boucheries. Les appareils de mesures les plus courants dans ce secteur sont des balances.",
				"Pétrolier au détail": "Le secteur pétrolier au détail comprend la vente de produits du pétrole raffiné liquide (e.g. essence, diesel, propane) et les carburants de remplacement liquides (e.g. hydrogène, éthanol) dans les stations-service, marinas, stations de ravitaillement pour camion, etc.  Les appareils de mesures les plus courants dans ce secteur sont les pompes à carburant et les compteurs de propane."
			},
			bDesc: "mesurant avec précision",
			yDesc: "mesurant de façon impréçise",
			errMsg: "Aucune inspection a été effectuée en "
		},
		chartH2: "",
		chartH3: "",
		wbtablesCaption: "",
		chartDesc: "",
		year: "",
		label: "",
		ctrlId: "",
		formgroup: "",
		slct: "",
		pieChartDetailsPercentage: "",
		pieChart: '<section class="chart--bg"><div class="charts--container"><div class="chart"><h2 class="mrgn-tp-0 text-center"></h2><h3 class="mrgn-tp-sm text-center h4"></h3><div id="pieChart"><svg id="pieChartSVG"><defs><filter id="pieChartInsetShadow"><feOffset dx="0" dy="0" /><feGaussianBlur stdDeviation="3" result="offset-blur" /><feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" /><feFlood flood-color="black" flood-opacity="1" result="color" /><feComposite operator="in" in="color" in2="inverse" result="shadow" /><feComposite operator="over" in="shadow" in2="SourceGraphic" /></filter><filter id="pieChartDropShadow"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" /><feOffset in="blur" dx="0" dy="3" result="offsetBlur" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs></svg></div><p class="chart--desc col-xs-12"></p></div></div></section>'
	};

	var intVal = function(i) {
		"use strict";
		return typeof i === "string" ? i.replace(/[,]/g, '') * 1 : typeof i === "number" ? i : 0;
	};

	var sumIntVal = function(a, b) {
		"use strict";
		return intVal(a) + intVal(b);
	};

	var graphData = function() {
		"use strict";
		var columnPercentage = function(a, b) {
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

	var sumFooter = function() {
		"use strict";

		api.columns((":not(.select-filter)"), {
				page: "current"
			})
			.every(function () {
							var sum = this.columns(this.index(), {
								page: "current"
							}).data()[0].reduce(sumIntVal, 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, state[state.lang].sep);
								$(this.footer()).html(sum);
							});
	};

	var initChart = function(bVal, yVal) {
		"use strict";
		var data = {
			pieChart: [{
				color: "blue",
				description: state[state.lang].bDesc,
				value: bVal
			}, {
				color: "yellow",
				description: state[state.lang].yDesc,
				value: yVal
			}]
		};
		var DURATION = 1500;
		var DELAY = 500;
		var drawPieChart = function(elementId, data) {
			var containerEl = document.getElementById(elementId);
			var width = containerEl.clientWidth;
			var height = width * 0.4;
			var radius = Math.min(width, height) / 2;
			var container = d3.select(containerEl);
			var svg = container.select("svg").attr("width", width).attr("height", height);
			var pie = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(90)");
			var detailedInfo = svg.append("g").attr("class", "pieChart--detailedInformation");
			var pieData = d3.layout.pie().value(function(d) {
				return d.value;
			});
			var arc = d3.svg.arc().outerRadius(radius - 20).innerRadius(0);
			var drawDetailedInformation = function(data, element) {
				var bBox = element.getBBox();
				var infoWidth = width * 0.3;
				var anchor;
				var infoContainer;
				var position;

				if (data.color === "yellow") { //(bBox.x + bBox.width / 2) < - 2.3
					infoContainer = detailedInfo.append("g").attr("width", infoWidth).attr("transform", "translate(" + (width - infoWidth) + "," + 135 + ")");
					anchor = "end";
					position = "right";
				}
				else {
					infoContainer = detailedInfo.append("g").attr("width", infoWidth).attr("transform", "translate(" + 0 + "," + (bBox.height + bBox.y - 45) + ")");
					anchor = "start";
					position = "left";
				}
				infoContainer.data([data.value * 100]).append("text").text("0 %").attr("class", "pieChart--detail--percentage").attr("x", (position === "left" ? 0 : infoWidth)).attr("y", -10).attr("text-anchor", anchor).transition().duration(DURATION).tween("text", function(d) {
					// var i = d3.interpolate( Uncomment to add decimal to percentage result
					var i = d3.interpolateRound(+this.textContent.replace(/\s%/ig, ""), d); // Comment to add decimal to percentage result
					return function(t) {
						// this.textContent = i(t).toFixed(1) + " %"; Uncomment to add decimal to percentage result
						this.textContent = i(t) + " %"; // Comment to add decimal to percentage result
					};
				});
				infoContainer.append("line").attr("class", "pieChart--detail--divider").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 0).transition().duration(DURATION).attr("x2", infoWidth);

				infoContainer.data([data.description]).append("text").attr('text-anchor', "start").attr("y", 20).attr("class", "pieChart--detail--textContainer " + "pieChart--detail__" + position).text(data.description);
			};

			var drawChartCenter = function() {
				var centerContainer = pie.append("g").attr("class", "pieChart--center");
				centerContainer.append("circle").attr("class", "pieChart--center--outerCircle").attr("r", 0).attr("filter", "url(#pieChartDropShadow)").transition().duration(DURATION).delay(DELAY).attr("r", radius - 50);
				centerContainer.append("circle").attr("id", "pieChart-clippy").attr("class", "pieChart--center--innerCircle").attr("r", 0).transition().delay(DELAY).duration(DURATION).attr("r", radius - 55).attr("fill", "#fff");
			};
			pie.datum(data).selectAll("path").data(pieData).enter().append("path").attr("class", function(d) {
				return "pieChart__" + d.data.color;
			}).attr("filter", "url(#pieChartInsetShadow)").attr("d", arc).transition().duration(DURATION).attrTween("d", function(d) {
				var interpolate = d3.interpolate(this.curAngle, d);
				this.curAngle = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			}).each(function() {
				this.curAngle = {
					startAngle: 0,
					endAngle: 0
				};
			}).each("end", function handleAnimationEnd(d) {
				drawDetailedInformation(d.data, this);
				//                }
			});
			drawChartCenter();
		};
		svgHeight = document.getElementById("pieChartSVG").clientHeight;
		if (typeof bVal === "number" && typeof yVal === "number" && !isNaN(bVal) && !isNaN(yVal)) {
			if ($("p.pieChart--detail--percentage")) {
				msgHeight = $(".pieChart--detail--percentage").height();
				$("#pieChartSVG").attr("height", svgHeight + msgHeight + 11.5);
				$("p.pieChart--detail--percentage").remove();
			}
			drawPieChart("pieChart", data.pieChart);
		}
		else {
			//var provinces = $($region).val().trim();
			//var trade = $($trade).val().trim().toLowerCase();
			var year = $($year).val().trim();
			var sNoInspectionMsg = state[state.lang].errMsg + year;

			$("p.pieChart--detail--percentage").remove();
			$(".chart--desc").before('<p class="pieChart--detail--percentage slide-in">' + sNoInspectionMsg + '</p>');
			msgHeight = $(".pieChart--detail--percentage").height();
			$("#pieChartSVG").attr("height", svgHeight - msgHeight - 11.5);
		}
	};

	// Pure function to render neccessary virtual DOM for infographics controls				
	var render = function(state) {
		"use strict";

		// Initiating the filter section
		var filter = $('<h2 class="wb-inv">' + state[state.lang].filterh2 + '</h2><div class="panel panel-default"><header class="panel-heading"><h3 class="h4 mrgn-tp-0 mrgn-bttm-0">' + state[state.lang].filterh3 + '</h3></header><div class="panel-body"><p class="mrgn-tp-md">' + state[state.lang].filtertxt + '</p><form class="wb-tables-filter" data-bind-to="dataset-filter"> <div class="row"><div class="col-xs-6"><button type="submit" class="btn btn-primary" aria-controls="dataset-filter">' + state[state.lang].filtersubmitbutton + '</button></div><div class="col-xs-6"><button type="reset" class="btn btn-default pull-right">' + state[state.lang].filterclearbutton + '</button></div></div></form></div></div>');
		var divgroups = "";
		
		// Initiating dropdown lists from data in table
		api.columns(".select-filter").every(function(index) {
			state.label = $(this.header()).text();
			state.ctrlId = state.label.substr(0, state.label.indexOf(" ")) ? "dt_" + state.label.substr(0, state.label.indexOf(" ")).toLowerCase() : "dt_" + state.label.toLowerCase();
			state.formgroup = $('<div class="form-group"><label for="' + state.ctrlId + '">' + state.label + '</label></div>');

			state.slct = $('<select class="form-control" id="' + state.ctrlId + '" name="' + state.ctrlId + '" data-column="' + index + '"></select>').appendTo(state.formgroup);

			this.data().unique().sort().each(function(val) {
				var optVal = $.parseHTML(val);
				if (state.slct.attr("id") === "dt_provinces" && state.slct.children().length === 0) {
					state.slct.append('<option value="">' + state[state.lang].aRegion + '</option>');
				}
				state.slct.append('<option value="' + $(optVal).text() + ' ">' + $(optVal).text() + '</option>');
			});
			divgroups += state.formgroup[0].outerHTML;
		
		});
		filter.find("form").prepend(divgroups);
		return filter;
	};

	var updateUI = function() {
		"use strict";

		// Display data from current year and appropriate sector
		var b = graphData().accurate;
		var y = graphData().inaccurate;
		var region = $($region).find("option:selected").html().trim();
		api.search($($trade).val().trim() + " " + $($year).val().trim()).draw();
		$(".wb-tables td, .wb-tables th").removeClass("bg-info");
		if ($($region).val() !== "") {
			$("tr:contains(" + region + ") td, tr:contains(" + region + ") th").addClass("bg-info");
			b = intVal($("tr:contains(" + region + ") td:eq(1)").text()) / intVal($("tr:contains(" + region + ") td:eq(0)").text());
			y = intVal($("tr:contains(" + region + ") td:eq(2)").text()) / intVal($("tr:contains(" + region + ") td:eq(0)").text());
		}

		// Summing up the data in the footer
		sumFooter();

		// State machine
		$(".chart h2").html(state.chartH2);
		$(".chart h3").html(state.chartH3);
		$(".wb-tables caption").html(state.wbtablesCaption);
		$(".chart--desc").html(state.chartDesc);

		// Redraw graph
		if ($("#pieChartSVG g")) {
			$("#pieChartSVG g").remove();
		}
		initChart(b, y);
	};

	var initUI = function() {
		"use strict";
		api = $(".wb-tables").dataTable().api();
		$("#filter-options").html(render(state));
		$("#chart-ui").html(state.pieChart.toString());
		$trade = $("#filter-options").find("select:eq(0)");
		$year = $("#filter-options").find("select:eq(1)");
		$region = $("#filter-options").find("select:eq(2)");
		$($trade).siblings("label").text(state[state.lang].tradeLabel);
		$($year).siblings("label").text(state[state.lang].yearLabel);
		$($region).siblings("label").text(state[state.lang].provinceLabel);
		$($year).find("option:last").attr("selected", "selected");

		// Set initial values
		state.chartH2 = $($trade).val().trim();
		state.chartH3 = state[state.lang].aRegion + " (" + $($year).val().trim() + ")";
		state.wbtablesCaption = state[state.lang].compliance + " (" + $($trade).val().trim() + " " + $($year).val().trim() + ")";
		state.chartDesc = state[state.lang].tradeDesc[$($trade).val().trim()];
		updateUI();

		$("#filter-options button[type='submit']").on("click", function() {
			// state changes here
			state.chartH2 = $trade.val().trim();
			state.chartH3 = $($region).find("option:selected").html().trim() + " (" + $($year).val().trim() + ")";
			state.wbtablesCaption = state[state.lang].compliance + " (" + $($trade).val().trim() + " " + $($year).val().trim() + ")";
			state.chartDesc = state[state.lang].tradeDesc[$trade.val().trim()];
			updateUI();
		});
	};
	initUI();
});
