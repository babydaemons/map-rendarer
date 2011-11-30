function BoundsMarker(map, latLng, id) {
  this._latLng = latLng;
  this.setMap(map);
}
BoundsMarker.prototype = new google.maps.OverlayView();

BoundsMarker.prototype.draw = function() {
  // 何度も呼ばれる可能性があるので、div_が未設定の場合のみ要素生成
   if (!this._div) {
     // 出力したい要素生成
     this._div = document.createElement( "div" );
     this._div.style.position = "absolute";
     this._div.style.width = "8px";
     this._div.style.height = "8px";
     this._div.style.backgroundColor = "#FF0000";
     // 要素を追加する子を取得
     var panes = this.getPanes();
     // 要素追加
     panes.overlayLayer.appendChild( this._div );
   }
   // 緯度、経度の情報を、Pixel（google.maps.Point）に変換
   var point = this.getProjection().fromLatLngToDivPixel( this._latLng );

   // 取得したPixel情報の座標に、要素の位置を設定
   this._div.style.left = (point.x - 4) + 'px';
   this._div.style.top = (point.y - 4) + 'px';
}

/* 削除処理の実装 */
BoundsMarker.prototype.remove = function() {
  if (this._div) {
    this._div.parentNode.removeChild(this._div);
    this._div = null;
  }
}
