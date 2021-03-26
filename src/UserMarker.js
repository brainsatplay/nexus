
import * as THREE from 'three'

// let zoom = 1;
export class UserMarker {
  constructor(settings) {
    this.latitude = settings.latitude
    this.longitude = settings.longitude
    this.d = settings.diameter;
    this.meshWidth = settings.meshWidth;
    this.meshHeight = settings.meshHeight;
    this.x = this.mercX(this.longitude);
    this.y = this.mercY(this.latitude);
    this.geometry;
    this.material;
    this.sphere;
    this.prevSpheres = []
    this.createSphere()
  }

  updateMesh(meshWidth,meshHeight){
    this.meshWidth = meshWidth;
    this.meshHeight = meshHeight;
    this.x = this.mercX(this.longitude);
    this.y = this.mercY(this.latitude);
    this.createSphere()
  }

  setLatitude(lat){
    this.y = this.mercY(lat);
  }
  
  setLongitude(lon){
    this.x = this.mercX(lon);
  }

  setGeolocation(geolocation){
    this.setLatitude(geolocation.latitude)
    this.setLongitude(geolocation.longitude)
    this.createSphere()
  }

  createSphere(){
    // Log old sphere
    if (this.sphere != undefined) {this.prevSpheres.push(this.sphere)}

    // Create new sphere
    this.geometry = new THREE.SphereGeometry( this.d,10,10);
    this.material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    this.material.transparent = true;
    // this.material.opacity = 0.5
    this.sphere = new THREE.Mesh( this.geometry, this.material );
    this.sphere.position.set(this.x-this.meshWidth/2, -this.y+this.meshHeight/2, 0.1);
    this.sphere.opacity = 0.5
  }

  mercX(lon) { 
    return (lon+180)*(this.meshWidth/360)
  }
  
  mercY(lat) {
    return ((this.meshHeight/180.0) * (90 - lat));
  }

}