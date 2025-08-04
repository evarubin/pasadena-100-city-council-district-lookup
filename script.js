async function lookupDistrict() {
  const rawAddress = document.getElementById('address').value;
  const resultDiv = document.getElementById('result');

  if (!rawAddress) {
    resultDiv.innerHTML = '<strong>Please enter an address.</strong>';
    return;
  }

  // Reformat address if missing commas
  let formattedAddress = rawAddress.trim();
  if (!formattedAddress.includes(',')) {
    const parts = formattedAddress.split(/\s+/);
    if (parts.length >= 5) {
      formattedAddress = `${parts.slice(0, -3).join(' ')}, ${parts.slice(-3, -2).join(' ')}, ${parts.slice(-2).join(' ')}`;
    }
  }

  resultDiv.innerHTML = '📍 Looking up your district...';

  try {
    const geocodeUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(formattedAddress)}&f=json&outFields=*&maxLocations=1`;
    console.log('Geocode URL:', geocodeUrl);

    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.candidates || geocodeData.candidates.length === 0) {
      resultDiv.innerHTML = '<strong>Address not found. Please check and try again.</strong>';
      return;
    }

    const { x, y } = geocodeData.candidates[0].location;
    console.log(`Coordinates for ${formattedAddress}: x=${x}, y=${y}`);

    const districtUrl = 'https://services2.arcgis.com/zNjnZafDYCAJAbN0/ArcGIS/rest/services/City_Council_Districts_view/FeatureServer/query';

    const districtRes = await fetch(districtUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        f: 'json',
        geometry: `${x},${y}`,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        returnGeometry: 'false'
      })
    });

    const districtData = await districtRes.json();
    console.log('District Response:', districtData);

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

