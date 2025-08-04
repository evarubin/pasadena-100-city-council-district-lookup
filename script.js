async function lookupDistrict() {
  const address = document.getElementById('address').value;
  const resultDiv = document.getElementById('result');

  if (!address) {
    resultDiv.innerHTML = '<strong>Please enter an address.</strong>';
    return;
  }

  resultDiv.innerHTML = '📍 Looking up your district...';

  try {
    const geocodeUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(address)}&f=json&outFields=*&maxLocations=1`;
    console.log('Geocode URL:', geocodeUrl);

    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      resultDiv.innerHTML = '<strong>Address not found. Please check and try again.</strong>';
      return;
    }

    const { x, y } = geocodeData.candidates[0].location;
    console.log('Coordinates:', x, y);

    const districtUrl = `https://services.arcgis.com/peir6zCCgZW6bVZP/arcgis/rest/services/City_Council_Districts/FeatureServer/0/query?geometry=${x},${y}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&outFields=*&returnGeometry=false&f=json`;
    console.log('District Query URL:', districtUrl);

    const districtRes = await fetch(districtUrl);
    const districtData = await districtRes.json();

    if (!districtData.features || districtData.features.length === 0) {
      resultDiv.innerHTML = '<strong>Could not find a district for this location.</strong>';
      return;
    }

    const attributes = districtData.features[0].attributes;
    const district = attributes.DISTRICT || 'Unknown';
    const member = attributes.MEMBER || 'your district representative';

    resultDiv.innerHTML = `<strong>✅ You are in Pasadena City Council District ${district}</strong><br /><br />Councilmember: ${member}`;
  } catch (error) {
    console.error('Error during lookup:', error);
    resultDiv.innerHTML = '<strong>Something went wrong. Please try again later.</strong>';
  }
}
