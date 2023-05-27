// Initialize the two maps
function initMaps() {

    var mapOptions = {
        center: { lat: 40.7128, lng: -74.0060 }, // Default center coordinates (New York City)
        zoom: 10, // Default zoom level
        streetViewControl: false,
        fullscreenControl: false,
        scaleControl: true,
        isFractionalZoomEnabled: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
    };

    var map1 = new google.maps.Map(document.getElementById('map1'), mapOptions);
    var map2 = new google.maps.Map(document.getElementById('map2'), mapOptions);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map1.setCenter(pos);
          map2.setCenter(pos);
        })
  
      }
  

    const input1 = document.getElementById("pac-input1")
    const input2 = document.getElementById("pac-input2")
    const searchBox1 = new google.maps.places.SearchBox(input1)
    const searchBox2 = new google.maps.places.SearchBox(input2)

    input1.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 || event.key === 'Enter') {
        input1.blur()
      }
    });
    input2.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 || event.key === 'Enter') {
        input2.blur()
      }
    });

    var previousViewportHeight = window.innerHeight;

    window.addEventListener('resize', function() {
      var viewportHeight = window.innerHeight;

      if (viewportHeight > previousViewportHeight) {
        input1.blur()
        input2.blur()
      }

      // Update the previous viewport height for the next event
      previousViewportHeight = viewportHeight;
    });

    map1.controls[google.maps.ControlPosition.TOP_LEFT].push(input1);
    google.maps.event.addListenerOnce(map1, "idle", () => { 
        setTimeout(() => {input1.style.setProperty("display", "block", "important");}, 600);});
    
    // Bias the SearchBox results towards current map's viewport.
    map1.addListener("bounds_changed", () => {
      searchBox1.setBounds(map1.getBounds());
    });
    map2.controls[google.maps.ControlPosition.TOP_LEFT].push(input2);
    google.maps.event.addListenerOnce(map2, "idle", () => { 
        setTimeout(() => {input2.style.setProperty("display", "block", "important");}, 600);});
    // Bias the SearchBox results towards current map's viewport.
    map2.addListener("bounds_changed", () => {
      searchBox2.setBounds(map2.getBounds());
    });

    let markers1 = [];
    let markers2 = [];

    searchBox1.addListener("places_changed", (s=searchBox1, mar=markers1, map=map1) => {placesChangedListener(s, mar, map)});
    searchBox2.addListener("places_changed", (s=searchBox2, mar=markers2, map=map2) => {placesChangedListener(s, mar, map)});


    let zooming = false
    google.maps.event.addListener(map1, 'center_changed', function() {
      if (!zooming) {
        zooming = true;
        scale = metersPerPixel(map1.getCenter().lat(), map1.getZoom())
        map2.setZoom(zoomFromScale(map2.getCenter().lat(), scale));
        // console.log(`map1 scale: ${scale.toFixed(2)}, map2 scale: ${metersPerPixel(map2.getCenter().lat(), map2.getZoom()).toFixed(2)}\
        // \nmap1 zoom:  ${map1.getZoom().toFixed(2)},  map2 zoom:  ${map2.getZoom().toFixed(2)}`)
        zooming = false;
    }
    })
    google.maps.event.addListener(map2, 'center_changed', function() {
      if (!zooming) {
        zooming = true;
        scale = metersPerPixel(map2.getCenter().lat(), map2.getZoom())
        map1.setZoom(zoomFromScale(map1.getCenter().lat(), scale));
        // console.log(`map1 scale: ${metersPerPixel(map1.getCenter().lat(), map1.getZoom()).toFixed(2)}, map2 scale: ${scale.toFixed(2)}\
        // \nmap1 zoom: ${map1.getZoom().toFixed(2)},  map2 zoom: ${map2.getZoom().toFixed(2)}`)
        zooming = false;
    }
    })

    // Link the zoom levels of the two maps
    google.maps.event.addListener(map1, 'zoom_changed', function() {
        if (!zooming) {
            zooming = true;
            scale = metersPerPixel(map1.getCenter().lat(), map1.getZoom())
            map2.setZoom(zoomFromScale(map2.getCenter().lat(), scale));
            // console.log(`map1 scale: ${scale.toFixed(2)}, map2 scale: ${metersPerPixel(map2.getCenter().lat(), map2.getZoom()).toFixed(2)}\
            // \nmap1 zoom:  ${map1.getZoom().toFixed(2)},  map2 zoom:  ${map2.getZoom().toFixed(2)}`)
            zooming = false;
        }
    });

    google.maps.event.addListener(map2, 'zoom_changed', function() {
        if (!zooming) {
            zooming = true;
            scale = metersPerPixel(map2.getCenter().lat(), map2.getZoom())
            map1.setZoom(zoomFromScale(map1.getCenter().lat(), scale));
            // console.log(`map1 scale: ${metersPerPixel(map1.getCenter().lat(), map1.getZoom()).toFixed(2)}, map2 scale: ${scale.toFixed(2)}\
            // \nmap1 zoom: ${map1.getZoom().toFixed(2)},  map2 zoom: ${map2.getZoom().toFixed(2)}`)
            zooming = false;
        }
    });
    }

function metersPerPixel(lat, zoom) {
    return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)
}

function zoomFromScale(lat, metersPerPixel) {
    return Math.log(156543.03392 * Math.cos(lat * Math.PI / 180) / metersPerPixel) / Math.log(2)
}

function placesChangedListener(searchBox, markers, map) {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  }

// Load the Google Maps JavaScript API
function loadMapsAPI() {
    var script = document.createElement('script');
    script.src = '/.netlify/functions/load_maps'; //This script specifies the callback as initMaps
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
    const input1 = document.getElementById("pac-input1")
}

// Start loading the Maps API
window.onload = loadMapsAPI;
