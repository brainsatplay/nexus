
import * as THREE from 'three'

// let zoom = 1;
export class UserMarker {
  constructor(settings) {
    this.latitude = settings.latitude
    this.longitude = settings.longitude
    this.d = settings.diameter;
    this.meshWidth = settings.meshWidth;
    this.meshHeight = settings.meshHeight;
    this.x = this.mercX();
    this.y = this.mercY();
    this.geometry;
    this.material;
    this.marker;
    this.prevMarkers = []
    this.createMarker()
  }

  updateMesh(meshWidth,meshHeight){
    this.meshWidth = meshWidth;
    this.meshHeight = meshHeight;
    this.x = this.mercX();
    this.y = this.mercY();
    console.log(this.x,this.y)
    this.createMarker()
  }

  setLatitude(lat){
    this.latitude = lat
    this.y = this.mercY(lat);
  }
  
  setLongitude(lon){
    this.longitude = lon
    this.x = this.mercX(lon);
  }

  setGeolocation(geolocation){
    this.setLatitude(geolocation.latitude)
    this.setLongitude(geolocation.longitude)
    this.createMarker()
  }

  createMarker(){
    // Log old sphere
    if (this.marker != undefined) {this.prevMarkers.push(this.marker)}

    // this.marker = new THREE.PointLight(0xff0000, 100,0.1);
    // this.marker.position.set(this.x, this.y, 0.15);
    // // Create new sphere
    this.geometry = new THREE.SphereGeometry( this.d,10,10);
    this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: 0.5, transparent: true} );
    this.marker = new THREE.Mesh( this.geometry, this.material );
    this.marker.position.set(this.x, this.y, 0.12);
    this.marker.geometry.computeBoundingBox()
  }

  mercX(lon=this.longitude) { 
    return (lon+180)*(this.meshWidth/360) - this.meshWidth/2
  }
  
  mercY(lat=this.latitude) {
    return -((this.meshHeight/180.0) * (90 - lat)) + this.meshHeight/2;
  }

}