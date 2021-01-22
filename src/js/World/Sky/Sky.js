import { Object3D, Vector3, DirectionalLight, Color, SphereBufferGeometry, ShaderMaterial, BackSide, Mesh } from 'three'
import SkyFrag from '@shaders/SkyFrag.frag'
import SkyVert from '@shaders/SkyVert.vert'

export default class Skybox {

  constructor(options) {

    //Set options
    this.debug = options.debug
    this.time = options.time

    //Set options for sphere color
    this.sphereTopColor = options.sphereTopColor
    this.sphereBottomColor = options.sphereBottomColor

    // Set up
    this.container = new Object3D()

    this.createSkyBox()

  }

  createSkyBox() {
    this.uniforms = {
      "topColor": { value: new Color(  this.sphereTopColor ) },
      "bottomColor": { value: new Color(  this.sphereBottomColor ) },
      "offset": { value: 20 },
      "exponent": { value: 2 }
    }
    
    this.skyGeo = new SphereBufferGeometry( 200, 32, 45)
    this.skyMat = new ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: SkyVert,
      fragmentShader: SkyFrag,
      side: BackSide
    })
    this.sky = new Mesh( this.skyGeo, this.skyMat)

    this.time.on('tick', () => {
      this.date = new Date()
      this.hours = this.date.getHours()
      this.minutes = this.date.getMinutes()
      // this.effectController.inclination = this.hours / 12 - 1 + this.minutes / 60 / 24
    })

    this.container.add(this.sky)
  }

}