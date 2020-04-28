const canvas = document.getElementById("map");
const map = new harp.MapView({
	canvas,
	theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
	//theme: "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_base_globe.json",
	projection: harp.sphereProjection,
	//For tile cache optimization:
	maxVisibleDataSourceTiles: 40,
	tileCacheSize: 100,
});

map.setCameraGeolocationAndZoom(new harp.GeoCoordinates(62.534056, 6.5895), 4);

const mapControls = new harp.MapControls(map);
const ui = new harp.MapControlsUI(mapControls);
canvas.parentElement.appendChild(ui.domElement);

map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new harp.OmvDataSource({
	baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
	apiFormat: harp.APIFormat.XYZOMV,
	styleSetName: "tilezen",
	authenticationCode: "AAQvEjUFTdOL3EX8ymckLAA",
});
map.addDataSource(omvDataSource);

fetch("wireless-hotspots.geojson")
	.then((data) => data.json())
	.then((data) => {
		const geoJsonDataProvider = new harp.GeoJsonDataProvider("wireless-hotspots", data);
		const geoJsonDataSource = new harp.OmvDataSource({
			dataProvider: geoJsonDataProvider,
			name: "wireless-hotspots",
		});

		/*
      Code from next section goes here
   */
		map.addDataSource(geoJsonDataSource).then(() => {
			const styles = [
				{
					when: "$geometryType == 'point'",
					technique: "circles",
					renderOrder: 10000,
					attr: {
						color: "#7ED321",
						size: 15,
					},
				},
			];
			geoJsonDataSource.setStyleSet(styles);
			map.update();
		});
	});

var latitude, longitude;

canvas.onclick = (evt) => {

	//Get the position of the click
	const geoPosition = map.getGeoCoordinatesAt(evt.pageX, evt.pageY);

	latitude = geoPosition.latitude;
	longitude = geoPosition.longitude;

	if (longitude > 4.0 && longitude < 8.0 && latitude > 61.0 && latitude < 63.0) {
      console.log(latitude);
      console.log(longitude);
      window.location.href = "index2.html";
	}
};

function goToCity() {
	window.location.href = "index2.html";
  }