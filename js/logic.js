var defmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var google = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var map = L.map('map', { center: [-7.567461, 110.821216], zoom: 13.5, layers: [google] });

const bl = {
    'Open Street Map': defmap, 'Open Topographic': OpenTopoMap, "Google Maps": google, "Google Satellite": googleSat
}

// const batasKota = async () => {
//     const response = await fetch('http://localhost:3030/api/bataskota/1', {
//         method: "GET", // or 'PUT'
//         headers: {
//             "Content-Type": "application/json",
//         },
//     });
//     const result = await response.json();
//     return result;
// }

// save result batasKota to a variable using await
// const kota = async () => {
//     const result = await batasKota();
//     return result.data.data
// }

// kota().then((result) => {
//   console.log(result)
// }).catch((err) => {
//   console.log(err)
// })

// L.geoJson(kota).addTo(map);
let layerControl = L.control.layers(bl).addTo(map)
L.Control.geocoder().addTo(map);

let btnKalul1Clicked = false;
let kalul1Layer;
const btnKalul1 = document.querySelector('#btn-kalul1');
btnKalul1.addEventListener('click', async function () {
  const kelBtn = document.querySelector('#btn-kelurahan');
  const kecBtn = document.querySelector('#btn-kecamatan');
  if (btnKalul1Clicked) {
      map.removeLayer(kalul1Layer);
      btnKalul1Clicked = false;
  } else {
    kalul1Layer = new L.LayerGroup();
    const response = await fetch('http://localhost:3030/api/kalul1/1', {
      method: "GET", // or 'PUT'
      headers: {
          "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    
    function style() {
      return {
          fillColor: 'orange',
          weight: 2,
          opacity: 0.8,
          color: 'yellow',
          dashArray: '0',
          fillOpacity: 0.2
      };
    }

    let kalulGeom = L.geoJson(result.data.data, {style: style});
    kalul1Layer.addTo(map);
    kalul1Layer.addLayer(kalulGeom);
    // const t = L.geoJson(result.data.data).addTo(map);
    btnKalul1Clicked = true;
  }  
});

let btnKotaClicked = false;
let kotaLayer;
const btnKota = document.querySelector('#btn-kota');
btnKota.addEventListener('click', async function () {
  const kelBtn = document.querySelector('#btn-kelurahan');
  const kecBtn = document.querySelector('#btn-kecamatan');
  if (btnKotaClicked) {
      map.removeLayer(kotaLayer);
      btnKotaClicked = false;
      kelBtn.disabled = false;
      kecBtn.disabled = false;
  } else {
    kelBtn.disabled = true;
    kecBtn.disabled = true;
    kotaLayer = new L.LayerGroup();
    const response = await fetch('http://localhost:3030/api/bataskota/1', {
      method: "GET", // or 'PUT'
      headers: {
          "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    
    function style() {
      return {
          fillColor: 'orange',
          weight: 2,
          opacity: 0.8,
          color: 'yellow',
          dashArray: '0',
          fillOpacity: 0.2
      };
    }

    let kotaGeom = L.geoJson(result.data.data, {style: style});
    kotaLayer.addTo(map);
    kotaLayer.addLayer(kotaGeom);
    // const t = L.geoJson(result.data.data).addTo(map);
    btnKotaClicked = true;
  }  
});

let btnKecamatanClicked = false;
let kecamatanLayer;
const btnKecamatan = document.querySelector('#btn-kecamatan');
btnKecamatan.addEventListener('click', async function () {
  const kotaBtn = document.querySelector('#btn-kota');
  const kelBtn = document.querySelector('#btn-kelurahan');
  if (btnKecamatanClicked) {
      map.removeLayer(kecamatanLayer);
      kotaBtn.disabled = false;
      kelBtn.disabled = false;
  } else {
    kotaBtn.disabled = true;
    kelBtn.disabled = true;
    kecamatanLayer = new L.LayerGroup();
    const response = await fetch('http://localhost:3030/api/bataskecamatan/1', {
      method: "GET", // or 'PUT'
      headers: {
          "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    function style() {
      return {
          fillColor: 'orange',
          weight: 2,
          opacity: 0.8,
          color: 'yellow',
          dashArray: '0',
          fillOpacity: 0.2
      };
    }
    
    let kecamatanGeom = L.geoJson(result.data.data, {style: style, onEachFeature: onEachFeature});

    function onEachFeature(feature, layer) {
      layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
      });

      function highlightFeature(e) {
        var layer = e.target;
    
        this.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        layer.bringToFront();
        info.update(layer.feature.properties);
      }
  
      function resetHighlight(e) {
        kecamatanGeom.resetStyle(e.target);
        this.bringToBack();
        info.update();
      }
  
      function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
      }
    }

    kecamatanLayer.addTo(map);
    kecamatanLayer.addLayer(kecamatanGeom);
    
    function namaDaerah() {
      let info = L.control();

      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
      };

      info.update = function (props) {
        this._div.innerHTML =(props ?
            '<b>' + props.Name
            : 'Arahkan Cursor');
      };
      info.addTo(map);
      return info;
    }
  }

  if (btnKecamatanClicked === false) {
    info = namaDaerah();
    btnKecamatanClicked = true;
  } else if (btnKecamatanClicked === true) {
    info.remove();
    btnKecamatanClicked = false;
  }
})

let btnKelurahanClicked = false;
let kelurahanLayer;
const btnKelurahan = document.querySelector('#btn-kelurahan');
btnKelurahan.addEventListener('click', async function () {
  const kotaBtn = document.querySelector('#btn-kota');
  const kecBtn = document.querySelector('#btn-kecamatan');
  if (btnKelurahanClicked) {
      map.removeLayer(kelurahanLayer);
      kotaBtn.disabled = false;
      kecBtn.disabled = false;
  } else {
    kotaBtn.disabled = true;
    kecBtn.disabled = true;
    kelurahanLayer = new L.LayerGroup();
    const response = await fetch('http://localhost:3030/api/bataskelurahan/1', {
      method: "GET", // or 'PUT'
      headers: {
          "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    function style() {
      return {
          fillColor: 'orange',
          weight: 2,
          opacity: 0.8,
          color: 'yellow',
          dashArray: '0',
          fillOpacity: 0.2
      };
    }
    
    let kelurahanGeom = L.geoJson(result.data.data, {style: style, onEachFeature: onEachFeature});


    function onEachFeature(feature, layer) {
      layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
      });

      function highlightFeature(e) {
        var layer = e.target;
    
        this.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        layer.bringToFront();
        info.update(layer.feature.properties);
      }
  
      function resetHighlight(e) {
        kelurahanGeom.resetStyle(e.target);
        this.bringToBack();
        info.update();
      }
  
      function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
      }
    }

    kelurahanLayer.addTo(map);
    kelurahanLayer.addLayer(kelurahanGeom);

    function namaDaerah() {
      let info = L.control();

      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
      };

      info.update = function (props) {
        this._div.innerHTML =(props ?
            props.WADMKC + '<br>' + '<b>' + 'Kelurahan ' + props.Name
            : 'Arahkan Cursor');
      };
      info.addTo(map);
      return info;
    }
  }  

  if (btnKelurahanClicked === false) {
    info = namaDaerah();
    btnKelurahanClicked = true;
  } else if (btnKelurahanClicked === true) {
    info.remove();
    btnKelurahanClicked = false;
  }
})

const BASE_URI = 'http://localhost:3030/api/';
let datePicker;
const field = document.querySelector('#date-picker');
var layer;
var sungaiLayer;
let id;
field.addEventListener('input', async function () {
    datePicker = field.value;
    const response = await fetch(BASE_URI + 'sungai/getGeomByDateApprove?q=' + datePicker, {
        method: "GET", // or 'PUT'
        headers: {
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    console.log(result)
    

    if (result?.data?.geom) {
        sungaiLayer = new L.LayerGroup();
        console.log('input new layer')
        map.eachLayer(function(layer) {
          console.log(layer)
          console.log('ini layer')
          if (layer._leaflet_id == id) {
            console.log('masuk')
            map.removeLayer(layer);
          }
            // if (!!layer.toGeoJSON) {
            //     map.removeLayer(layer);
            // }
        });
        // map.removeLayer(layer);


        var myLines = [result.data.geom]
        layer = L.geoJSON(myLines)
        layer.feature = {}
        layer.feature.type = 'Feature'
        layer.properties = {}
        layer.properties.popupContent = "aaaa"
        id = layer._leaflet_id;
        console.log(id)
        console.log(layer)
        sungaiLayer.addTo(map);
        sungaiLayer.addLayer(layer);
    } else{
        map.removeLayer(layer);
        // map.eachLayer(function(layer) {
        //     if (!!layer.toGeoJSON) {
        //         map.removeLayer(layer);
        //     }
        // });
    }
}); 
