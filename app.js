import "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-82.35554357626472, 29.643690288317917],
    zoom: 14,
    maxzoom: 20,
    minZoom: 12,
});

map.on('load', async () => {

        map.addSource('places', {
            'type': 'geojson',
            'data': 'bikeTheft.geojson'
            } 
        );

          map.addLayer(
            {
                'id': 'thefts-heat',
                'type': 'heatmap',
                'source': 'places',
                'paint': {
                    // Increase the heatmap color weight weight by zoom level
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        1,
                        9,
                        3
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparency color
                    // to create a blur-like effect.
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(172, 96, 33, 0)',
                        0.2,
                        'rgb(223, 78, 0)',
                        0.4,
                        'rgb(255, 129, 19)',
                        0.6,
                        'rgb(255, 170, 0)',
                        0.95,
                        'rgb(255, 217, 80)',
                        1,
                        'rgb(255, 241, 188)'
                    ],
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13,
                        20,
                        18,
                        32
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13.5,
                        1,
                        16,
                        0
                    ]
                }
            }
        );

         map.addLayer(
            {
                'id': 'thefts-point',
                'type': 'circle',
                'source': 'places',
                'minzoom': 15,
                'paint': {
                    'circle-radius': 8,
                    'circle-color': 'rgb(255, 170, 0)',
                    // Transition from heatmap to circle layer by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        16,
                        1
                    ]
                }
            }
        );

    //initialize popup
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

  //popup on hover
  let currentFeatureCoordinates = undefined;
  map.on('mousemove', 'thefts-point', (e) => {
      const featureCoordinates = e.features[0].geometry.coordinates.toString();
      if (currentFeatureCoordinates !== featureCoordinates) {
          currentFeatureCoordinates = featureCoordinates;
          
          map.getCanvas().style.cursor = 'pointer';

          const coordinates = e.features[0].geometry.coordinates.slice();
          const time = e.features[0].properties.time.slice(-11, -6) + e.features[0].properties.time.slice(-3);
          const vehicle = e.features[0].properties.vehicle;
          const date = e.features[0].properties.date

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          // Populate the popup
          popup.setLngLat(coordinates).setHTML(vehicle + " stolen on " + date + " at " + time).addTo(map);
      }
    });

    map.on('mouseleave', 'thefts-point', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
    currentFeatureCoordinates = undefined;
    });

    //change key based on zoom level
    const heatmapKey = document.getElementById('heatmapkey');
    const pointsKey = document.getElementById('pointskey');
    let currentZoom = undefined
    map.on('zoom', () => {
        currentZoom = map.getZoom();
        if (currentZoom > 15.5) {
            pointsKey.style.visibility = "visible";
            heatmapKey.style.visibility = "hidden";
        } else {
            pointsKey.style.visibility = "hidden";
            heatmapKey.style.visibility = "visible";
        }
    });

});
