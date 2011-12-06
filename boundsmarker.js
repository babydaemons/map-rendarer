function BoundsMarker(map, latLng, target, draggingHandler, draggedHandler) {
  this.latLng = latLng;
  this.target = target;
  this.setMap(map);
  var markerOptions = {
    draggable: true,
    map: map,
    position: latLng,
    visible: true
  };
  this.marker = new google.maps.Marker(markerOptions);
  google.maps.event.addListener(this.marker, "drag", function() { draggingHandler(target); });
  google.maps.event.addListener(this.marker, "dragend", draggedHandler);
}
BoundsMarker.prototype = new google.maps.OverlayView();

BoundsMarker.prototype.draw = function() {
  this.marker.setPosition(this.latLng);
}

/* 削除処理の実装 */
BoundsMarker.prototype.remove = function() {
  if (this.marker) {
    this.marker.setVisible(false);
    this.marker = null;
  }
}

/* 現在座標で位置を設定する。受け取った座標はfromLatLngToDivPixelでPixelに変換してDivのスタイルに設定。 */
BoundsMarker.prototype.setPosition = function(latLng) {
  this.latLng = latLng;
  this.draw();
}
