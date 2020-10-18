/* Magic Mirror
 * Module: MMM-VigiCrues
 *
 * Magic Mirror By Michael Teeuw https://magicmirror.builders
 * MIT Licensed.
 *
 * Module MMM-VigiCrues By Grena https://github.com/grenagit
 * MIT Licensed.
 */

Module.register("MMM-VigiCrues",{

	// Default module config
	defaults: {
		stationid: "",
		dataPeriod: 3 * 24 * 60, // 3 days
		dataInterval: 60, // 1 hour
		comparisonPeriod: 2 * 60, // 2 hours past
		updateInterval: 1 * 60 * 60 * 1000, // every 1 hour
		animationSpeed: 1000, // 1 second
		maxChartWidth: 0,
		maxChartHeight: 0,
		beginAtZero: true,
		useColorLegend: true,
		showChart: true,
		showChartBackground: true,

		colorLine: "#999",
		colorBackground: "#666",
		colorLegend: "#666",
		colorTick: "#666",
		colorLabel: "#666",

		alertTable: [],

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500, // 2,5 seconds

		apiBase: "https://hubeau.eaufrance.fr",
		hydroEndpoint: "api/v1/hydrometrie/observations_tr",
	},

	// Define required scripts
	getScripts: function() {
		return ["Chart.min.js"];
	},

	// Define required scripts
	getStyles: function() {
		return ["font-awesome.css", "MMM-VigiCrues.css"];
	},

	// Define start sequence
	start: function() {
		Log.info("Starting module: " + this.name);

		moment.locale(config.language);

		this.levelCurrent = null;
		this.alertColor = null;
		this.average = null;
		this.minimum = null;
		this.maximum = null;
		this.comparison = null;

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// Override dom generator
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.stationid === "") {
			wrapper.innerHTML = "Please set the correct station <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var medium = document.createElement("div");
		medium.className = "normal medium level";

		var levelIcon = document.createElement('span');

		if (this.config.useColorLegend && this.alertColor != null) {
			levelIcon.className = "fas fa-exclamation-triangle dimmed";
			levelIcon.style = "color: " + this.alertColor + ";";
		} else {
			levelIcon.className = "fas fa-ruler-vertical dimmed";
		}
		medium.appendChild(levelIcon);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		medium.appendChild(spacer);

		var levelValue = document.createElement("span");
		levelValue.className = "bright";
		levelValue.innerHTML = this.levelCurrent + "<span class=\"xsmall\">m</span>";;
		medium.appendChild(levelValue);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		medium.appendChild(spacer);

		var comparisonIcon = document.createElement('span');
		if (this.comparison > 0) {
			comparisonIcon.className = "fas fa-sort-up dimmed";
			if (this.config.useColorLegend) { comparisonIcon.style = "color: red;" };
			this.comparison = "+" + this.comparison;
		} else if (this.comparison < 0) {
			comparisonIcon.className = "fas fa-sort-down dimmed";
			if (this.config.useColorLegend) { comparisonIcon.style = "color: green;" };
		} else {
			comparisonIcon.className = "fas fa-sort dimmed";
		}
		medium.appendChild(comparisonIcon);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		medium.appendChild(spacer);

		var levelValue = document.createElement("span");
		levelValue.className = "bright";
		levelValue.innerHTML = this.comparison + "<span class=\"xsmall\">m</span>";;
		medium.appendChild(levelValue);

		wrapper.appendChild(medium);


		var small = document.createElement("div");
		small.className = "normal small comparison";

		var levelStats = document.createElement("span");
		levelStats.innerHTML = "Sur 30 jours :";
		levelStats.className = "xsmall";
		small.appendChild(levelStats);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		var levelMinimum = document.createElement("span");
		levelMinimum.innerHTML = "<i class=\"fas fa-minus-circle dimmed\"></i> " + this.minimum + "<span class=\"xsmall\">m</span>";
		small.appendChild(levelMinimum);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		var levelAverage = document.createElement("span");
		levelAverage.innerHTML = "<i class=\"fa fa-circle dimmed\"></i> " + this.average + "<span class=\"xsmall\">m</span>";
		small.appendChild(levelAverage);

		var spacer = document.createElement("span");
		spacer.innerHTML = "&nbsp;";
		small.appendChild(spacer);

		var levelMaximum = document.createElement("span");
		levelMaximum.innerHTML = "<i class=\"fas fa-plus-circle dimmed\"></i> " + this.maximum + "<span class=\"xsmall\">m</span>";
		small.appendChild(levelMaximum);

		wrapper.appendChild(small);

		if(this.config.showChart) {
			var chartWrapper = document.createElement("div");

			var history = document.createElement("canvas");
			var chart = new Chart(history, {
				type: 'line',
				data: {
					datasets: [
						{
							label: "Hauteur d'eau",
							data: this.chartData,
							backgroundColor: this.config.colorBackground,
							borderColor: this.config.colorLine,
							borderWidth: 2,
							fill: this.config.showChartBackground,
							pointRadius: 0,
						}
					]
				},
				options: {
					aspectRatio: 1,
					legend: {
						display: true,
						position: "bottom",
						labels: {
							fontColor: this.config.colorLegend,
						}
					},
					scales: {
						yAxes: [{
							display: true,
							ticks: {
								beginAtZero: this.config.beginAtZero,
								maxTicksLimit: 6,
								padding: 5,
								fontColor: this.config.colorTick,
							},
							scaleLabel: {
								display: true,
								labelString: "Hauteur (m)",
								fontColor: this.config.colorLabel,
							},
							gridLines: {
								color: this.config.colorLine,
								drawOnChartArea: false,
							}
						}],
						xAxes: [{
							display: true,
							type: 'time',
							ticks: {
								maxTicksLimit: 6,
								padding: 5,
								fontColor: this.config.colorTick,
							},
							time: {
								displayFormats: {
									hour: "DD/MM HH:mm",
									day: "DD/MM",
									week: "DD/MM",
									month: "MMM YY",
								}
							},
							gridLines: {
								color: this.config.colorLine,
								drawOnChartArea: false,
							}
						}]
					}
				}
			});

			if (this.config.maxChartWidth != 0) {
				chart.options.maintainAspectRatio = false;
				chart.canvas.style.width = this.config.maxChartWidth + 'px';
				chartWrapper.style.width = this.config.maxChartWidth + 'px';
			}
			if (this.config.maxChartHeight != 0) {
				chart.options.maintainAspectRatio = false;
				chart.canvas.style.height = this.config.maxChartHeight + 'px';
				chartWrapper.style.height = this.config.maxChartHeight + 'px';
			}

			chartWrapper.appendChild(history);
			wrapper.appendChild(chartWrapper);

			for(let i = 0; i < this.config.alertTable.length; i++) {
				chart.data.datasets.push({
					label: this.config.alertTable[i].title,
					data: this.referenceData[i],
					borderColor: this.config.alertTable[i].color,
					borderWidth: 2,
					borderDash: [10, 10],
					fill: true,
					pointRadius: 0
				});
				chart.update();
			}
		}

		return wrapper;
	},

	// Request new data from hubeau.eaufrance.fr
	updateHydro: function() {
		if (this.config.appid === "") {
			Log.error(this.name + ": APPID not set.");
			return;
		}

		var url = this.config.apiBase + "/" + this.config.hydroEndpoint + this.getParams();
		var self = this;
		var retry = true;

		var hydroRequest = new XMLHttpRequest();
		hydroRequest.open("GET", url, true);
		hydroRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processHydro(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = true;
				} else {
					Log.error(self.name + ": Could not load Hydro.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		hydroRequest.send();
	},

	// Use the received data to set the various values before update DOM
	processHydro: function(data) {
		if (!data || typeof data.data === "undefined") {
			Log.error(this.name + ": Do not receive usable data.");
			return;
		}

		this.config.alertTable.sort((a, b) => Number(a.value) - Number(b.value));

		this.levelCurrent = this.roundValue(data.data[0].resultat_obs / 1000, 2);

		this.levelValues = [];
		this.chartData = [];
		this.referenceData = [];
		for (let j = 0; j < this.config.alertTable.length; j++) {
			this.referenceData[j] = [];
			if(data.data[0].resultat_obs >= this.config.alertTable[j].value) {
				this.alertColor = this.config.alertTable[j].color;
			}
		}
		for (let i = 0; i < data.data.length; i++) {
			this.levelValues.push(parseInt(data.data[i].resultat_obs));

			if(i < Math.round(this.config.dataPeriod / this.config.dataInterval)) {
				this.chartData.push({"t": data.data[i].date_obs, "y": this.roundValue(data.data[i].resultat_obs / 1000, 2)});
				for (let j = 0; j < this.config.alertTable.length; j++) {
					this.referenceData[j].push({"t": data.data[i].date_obs, "y": this.roundValue(this.config.alertTable[j].value / 1000, 2)});
				}
			}
		}

		this.average = this.roundValue((this.levelValues.reduce((a, b) => a + b, 0) / this.levelValues.length) / 1000, 2);

		this.minimum = this.roundValue(Math.min(...this.levelValues) / 1000, 2);
		this.maximum = this.roundValue(Math.max(...this.levelValues) / 1000, 2);

		this.comparison = this.roundValue((data.data[0].resultat_obs - data.data[this.config.comparisonPeriod / this.config.dataInterval].resultat_obs) / 1000, 1);

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	// Schedule next update
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateHydro();
		}, nextLoad);
	},

	
	getParams: function() {
		let params = "?";

		params += "code_entite=" + this.config.stationid;
		params += "&timestep=" + this.config.dataInterval;
		params += "&pretty";
		params += "&grandeur_hydro=H";
		params += "&fields=date_obs,resultat_obs";

		return params;
	},

	// Round a value to n decimal
	roundValue: function(value, decimals) {
		let round = parseFloat(value).toFixed(decimals);
		if(round == 0) {
			round = parseFloat(0).toFixed(decimals);
		}

		return round;
	}

});
