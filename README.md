# Module: MMM-VigiCrues
This module displays the last valeu of water level at a station in the Vigicrues network in France, including chart and statistical information (minimum, average, maximum).

The max-height and max-width of the chart can be fixed. The amplitude and interval of the graph data and the age of the data used to determine the level assessment can also be fixed. Color Legend display may be enabled or disabled.

<!--<p align="left">
<img alt="MMM-VigiCrues Screenshot #1" src="MMM-VigiCrues_screenshot1.png" height="250px">
<img alt="MMM-VigiCrues Screenshot #2" src="MMM-VigiCrues_screenshot2.png" height="250px">
<img alt="MMM-VigiCrues Screenshot #3" src="MMM-VigiCrues_screenshot3.png" height="250px">
</p>-->

[MagicMirror Project on Github](https://github.com/MichMich/MagicMirror) | [Vigicrues](https://www.vigicrues.gouv.fr/)

## Installation:

In your terminal, go to your MagicMirror's Module folder:

```shell
cd ~/MagicMirror/modules
```
Clone this repository:
```shell
git clone https://github.com/grenagit/MMM-VigiCrues
```

Configure the module in your config.js file.

## Update:

In your terminal, go to your MMM-VigiCrues's Module folder:

```shell
cd ~/MagicMirror/modules/MMM-VigiCrues
```
Incorporate changes from this repository:
```shell
git pull
```

## Configuration:

### Basic configuration

To use this module, add it to the modules array in the `config/config.js` file:
```javascript
modules: [
	{
		module: "MMM-VigiCrues",
		position: "top_left",
		config: {
			stationid: "A123456789" // Station identifer (www.vigicrues.gouv.fr)
		}
	}
]
```
### Options

The following properties can be configured:


| Option                       | Description
| ---------------------------- | -----------
| `stationid`                  | The station identifer, which can be obtained on [Vigicrues](https://www.vigicrues.gouv.fr) portal (tab *Info Station*). <br><br>  This value is **REQUIRED**
| `dataPeriod`            		 | How often does the content needs to be fetched? (Minutes) <br><br> **Possible values:** `30` - `43200` <br> **Default value:** `3 * 24 * 60` (3 days)
| `dataInterval`               | How often does the content needs to be fetched? (Minutes) <br><br> **Possible values:** `10` - `60` <br> **Default value:** `60` (1 hour)
| `comparisonPeriod`           | How often does the content needs to be fetched? (Minutes) <br><br> **Possible values:** `10` - `43200` <br> **Default value:** `2 * 60` (2 hours past)
| `updateInterval`             | How often does the content needs to be fetched? (Milliseconds) <br><br> **Possible values:** `1000` - `86400000` <br> **Default value:** `1 * 60 * 60 * 1000` (1 hour)
| `animationSpeed`             | Speed of the update animation. (Milliseconds) <br><br> **Possible values:**`0` - `5000` <br> **Default value:** `1000` (1 second)
| `maxChartWidth`              | Maximum width for chart display. If set to 0, the chart's default width is used. (Pixels) <br><br> **Possible values:**`0` - `5000` <br> **Default value:** `0` (default width)
| `maxChartHeight`             | Maximum height for chart display. If set to 0, the chart's default height is used. (Pixels) <br><br> **Possible values:**`0` - `5000` <br> **Default value:** `0` (default height)
| `useColorLegend`             | Use the colored icons. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `initialLoadDelay`           | The initial delay before loading. If you have multiple modules that use the same API key, you might want to delay one of the requests. (Milliseconds) <br><br> **Possible values:** `1000` - `5000` <br> **Default value:**  `0`
| `retryDelay`                 | The delay before retrying after a request failure. (Milliseconds) <br><br> **Possible values:** `1000` - `60000` <br> **Default value:**  `2500`
| `apiBase`                    | The Hub'Eau API base URL. <br><br> **Default value:**  `'https://hubeau.eaufrance.fr'`
| `hydroEndpoint`              | The Hydrometry API endPoint. <br><br> **Default value:**  `'api/v1/hydrometrie/observations_tr'`

### Todo


### License

This module is licensed under the MIT License
