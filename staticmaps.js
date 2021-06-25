// http://la.ma.la/blog/diary_200608300350.htm
Array.prototype.shuffle = function() {
  var i = this.length;
  while(i){
    var j = Math.floor(Math.random()*i);
    var t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
}

function StaticMaps(map, tileWidth, tileHeight, logoHeight) {
  this.useGateway = true;
  this.map = map;
  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");
  this.TILE_W = tileWidth;
  this.TILE_H = tileHeight;
  this.LOGO_H = logoHeight;
  this.OFFSET_X = Math.floor(tileWidth / 2);
  this.OFFSET_Y = Math.floor((tileHeight + logoHeight) / 2);
  this.lowerWait = 800;
  return this;
}

StaticMaps.prototype.setBounds = function(projection, latLngSW, latLngNE) {
  this.projection = projection;
  this.latLngSW = latLngSW;
  this.latLngNE = latLngNE;
  this.pointSW = projection.fromLatLngToDivPixel(latLngSW);
  this.pointNE = projection.fromLatLngToDivPixel(latLngNE);
  this.x0 = this.pointSW.x;
  this.y0 = this.pointNE.y;
  this.MAP_W = this.pointNE.x - this.pointSW.x;
  this.MAP_H = this.pointSW.y - this.pointNE.y;
  this.MAP_WIDTH = Math.floor(this.MAP_W);
  this.MAP_HEIGHT = Math.floor(this.MAP_H);
  this.COLS = Math.ceil(this.MAP_W / this.TILE_W) + 1;
  this.ROWS = Math.ceil(this.MAP_H / this.TILE_H) + 1;
  this.TILES = this.COLS * this.ROWS;
  this.canvas.width  = this.COLS * this.TILE_W;
  this.canvas.height = this.ROWS * this.TILE_H + this.LOGO_H;
  //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  var w = this.TILE_W, h = this.TILE_H + this.LOGO_H;
  if (this.useGateway) {
    this.endpoint = location.href.replace(/[^\/]*$/, "") + "googlemapstatic.php";
  }
  else {
    this.endpoint = "http://maps.google.com/maps/api/staticmap";
  }
  this.params = [ "mobile=false", "key=AIzaSyD4UWzMCBt3E6NSIRMfcBMXiksCqwdfp2g", "size=" + w + "x" + h ];

  var maps = this;
  this.loadNext = function() {
    maps.progressCallback(maps.index, maps.TILES);
    maps.tiles[maps.index++].load();
  }

  this.tiles = [];
  for (var j = 0; j < this.ROWS; j++) {
    for (var i = 0; i < this.COLS; i++) {
      this.tiles.push(new StaticTile(maps, i, j));
    }
  }
  this.tiles.shuffle();
  this.index = 0;
}

StaticMaps.prototype.setProgressCallback = function(func) {
  this.progressCallback = func;
}

StaticMaps.prototype.setFinishedCallback = function(func) {
  this.finishedCallback = func;
}

StaticMaps.checkNext = function(maps) {
  maps.progressCallback(maps.index, maps.TILES);
  if (maps.index < maps.TILES) {
    setTimeout(maps.loadNext, maps.lowerWait + Math.floor(Math.random() * 5000));
    maps.lowerWait += 50;
  }
  else {
    setTimeout(maps.finishedCallback, 1);
  }
}

StaticMaps.prototype.getMapType = function() {
  var mapTypeId = this.map.getMapTypeId();
  if (mapTypeId == google.maps.MapTypeId.ROADMAP)   return "roadmap";
  if (mapTypeId == google.maps.MapTypeId.HYBRID)    return "hybrid";
  if (mapTypeId == google.maps.MapTypeId.SATELLITE) return "satellite";
  if (mapTypeId == google.maps.MapTypeId.TERRAIN)   return "terrain";
  return "roadmap";
}

StaticMaps.prototype.saveCanvas = function(canvas) {
  canvas.width = this.MAP_WIDTH;
  canvas.height = this.MAP_HEIGHT;

  var context = canvas.getContext("2d");
  context.drawImage(this.canvas, this.OFFSET_X, this.OFFSET_Y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  this.canvas.width = 0;
  this.canvas.height = 0;
  this.canvas = null;

  var mapTypeId = this.map.getMapTypeId();
  if (mapTypeId == google.maps.MapTypeId.ROADMAP)   return "image/png";
  if (mapTypeId == google.maps.MapTypeId.HYBRID)    return "image/jpeg";
  if (mapTypeId == google.maps.MapTypeId.SATELLITE) return "image/jpeg";
  if (mapTypeId == google.maps.MapTypeId.TERRAIN)   return "image/png";
  return "imgage/png";
}

function StaticTile(maps, i, j) {
  var img = new Image();
  var dx = i * maps.TILE_W;
  var dy = j * maps.TILE_H;
  img.onload = function() {
    maps.context.drawImage(img, 0, 0, maps.TILE_W, maps.TILE_H, dx, dy, maps.TILE_W, maps.TILE_H);
    StaticMaps.checkNext(maps);
  }
  this.img = img;
  this.dx = dx;
  this.dy = dy;

  this.x = maps.x0 + i * maps.TILE_W;
  this.y = maps.y0 + j * maps.TILE_H;
  this.latLng = maps.projection.fromDivPixelToLatLng(new google.maps.Point(this.x, this.y));
  var params = maps.params.slice(0);
  params.push("zoom=" + maps.map.getZoom());
  params.push("maptype=" + maps.getMapType());
  params.push("center=" + this.latLng.lat() + "," + this.latLng.lng());
  params.shuffle();
  var url = maps.endpoint + "?" + params.join("&");
  this.load = function() {
    img.src = url;
  }
  this.url = url;
}
