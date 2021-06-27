import { AudioListener, AxesHelper, Object3D } from 'three'
import { Octree } from 'three/examples/jsm/math/Octree'
import {gsap, Power3, Power4, Back} from 'gsap'

import AmbientLightSource from './Lights/AmbientLight'
import HemisphereLightSource from './Lights/HemisphereLight'
import Floor from './Floor'
import Perso from './Perso/Perso'
import Elmo from './Elmo/Elmo'
import Skybox from './Sky/Sky'
import BoxObjectManager from './BoxObject/BoxObjectManager'
import CanvasResult from './CanvasResult/CanvasResult'
import Seagull from './Seagull/Seagull'
import Butterfly from './Butterfly/Butterfly'
import Particles from './Particles/Particles'

import Data from '../../data/data.json'

export default class World {
  constructor(options) {
    // Set options
    this.perf = options.perf
    this.time = options.time
    this.sizes = options.sizes
    this.debug = options.debug
    this.assets = options.assets
    this.camera = options.camera
    this.scene = options.scene
    this.itemsIventory = options.itemsInventory
    this.body = options.body
    this.screenShot = options.screenShot
    this.appThis = options.appThis
    this.renderer = options.renderer
    this.composer = options.composer
    this.initButton = options.initButton
    this.music = options.music
    this.musicObject = options.musicObject

    
    this.qualityButton = options.qualityButton
    this.qualityDiv = options.qualityDiv
    
    this.openOptions = options.openOptions
    this.closeOptions = options.closeOptions
    this.openInventory = options.openInventory
    this.closeInventory = options.closeInventory
    this.bubbleInventory = options.bubbleInventory
    this.inventoryItems = options.inventoryItems
    this.bubbleOption = options.bubbleOption

    this.musicRange = options.musicRange
    this.ambianceRange = options.ambianceRange
    this.js_musicVol = options.js_musicVol
    this.js_ambianceVol = options.js_ambianceVol
    this.muteButton = options.muteButton
    this.unmuteButton = options.unmuteButton

    this.outline = options.outline

    // Set up
    this.container = new Object3D()
    this.worldOctree = new Octree()
    this.container.name = 'World'

    this.playerInventory = []
    this.elementEnteredArray = []
    this.curves = [
      [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ],
    ]

    this.musicFinVol = 1
    this.scrollValuePercentage = 0
    this.scrollValue = 0

    this.inventoryTL = new gsap.timeline()
    this.showPictureTL = new gsap.timeline()
    this.optionTL = new gsap.timeline()
    this.tutoTL = new gsap.timeline()
    this.speechTl = new gsap.timeline()

    this.showInventory = document.querySelector('.inventoryButton')
    this.showOptions = document.querySelector('.options')

    if (this.debug) {
      this.container.add(new AxesHelper(5))
      this.debugFolder = this.debug.addFolder('World')
      this.debugFolder.open()
    }
  }
  init() {
    this.setAmbientLight()
    this.setSky()
    this.setHemisphereLight()
    this.setAudioListener()
    this.setPerso()
    this.setElmo()
    this.setFloor()
    this.setBoxObjectManager()
    this.PlayerEnterObjectArea()
    this.PlayerEnterElmoArea()

    this.createUi()
    this.openOptionsMethod()
    this.closeOptionsMethod()

    if (this.perf != 'low') {
      this.setSeagull()
      this.setSeagull2()
      this.setSeagull3()
      this.setSeagull4()
      this.setSeagull5()
      this.setSeagull6()
      this.setButterfly()
      this.setButterfly2()
      this.setParticules()
    }
    this.openInventoryMethod()
    this.closeInventoryMethod()
    this.setSeagull()
    this.setSeagull2()
    this.setSeagull3()
    this.setSeagull4()
    this.setSeagull5()
    this.setSeagull6()
    this.setButterfly()
    this.setButterfly2()
    this.setParticules()
    this.screenCanvas()
    this.getMusicRangeValue()
    this.muteSoundMethod()
    this.unmuteSoundMethod()
    this.openDiagOne()
  }
  setAmbientLight() {
    this.ambientlight = new AmbientLightSource({
      debug: this.debugFolder,
    })
    this.container.add(this.ambientlight.container)
  }
  setHemisphereLight() {
    this.light = new HemisphereLightSource({
      debug: this.debugFolder,
    })
    this.container.add(this.light.container)
  }
  setFloor() {
    this.floor = new Floor({
      perf: this.perf,
      assets: this.assets,
      time: this.time,
      debug: this.debug,
      scene: this.scene,
      listener: this.listener,
      ambianceRange: this.ambianceRange,
      js_ambianceVol: this.js_ambianceVol,
      ambianceFinVol: 1,
    })
    this.container.add(this.floor.container)
    this.worldOctree.fromGraphNode(this.assets.models.PHYSICS.scene)
  }
  setPerso() {
    this.perso = new Perso({
      time: this.time,
      assets: this.assets,
      camera: this.camera,
      debug: this.debug,
      worldOctree: this.worldOctree,
      body: this.body,
      listener: this.listener,
    })
    this.container.add(this.perso.container)
  }

  setElmo() {
    this.elmo = new Elmo({
      time: this.time,
      assets: this.assets,
      camera: this.camera,
      debug: this.debug,
      worldOctree: this.worldOctree,
      body: this.body,
      perso: this.perso,
    })
    this.container.add(this.elmo.container)
  }
  setSky() {
    this.sky = new Skybox({
      time: this.time,
      debug: this.debug,
      renderer: this.renderer,
      composer: this.composer,
      sphereTopColor: 0x0096ff,
      sphereBottomColor: 0xa2dcfc,
      offset: 20,
      exponent: 2,
    })
    this.container.add(this.sky.container)
  }

  setSeagull() {
    this.seagull = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: this.curves[0],
      decal: -60,
      heightDecal: 20,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.001,
    })
    this.container.add(this.seagull.container)
  }

  setSeagull2() {
    this.seagull2 = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ],
      decal: -57,
      heightDecal: 22,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.00104,
    })
    this.container.add(this.seagull2.container)
  }

  setSeagull3() {
    this.seagull3 = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ],
      decal: -63,
      heightDecal: 18,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.00102,
    })
    this.container.add(this.seagull3.container)
  }

  setSeagull4() {
    this.seagull4 = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ].reverse(),
      decal: -55,
      heightDecal: 24,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.001,
    })
    this.container.add(this.seagull4.container)
  }

  setSeagull5() {
    this.seagull5 = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ].reverse(),
      decal: -52,
      heightDecal: 26,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.00104,
    })
    this.container.add(this.seagull5.container)
  }

  setSeagull6() {
    this.seagull6 = new Seagull({
      time: this.time,
      assets: this.assets,
      curve: [
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
        [-127.65484619140625, 88.41449737548828, 11.899239540100098],
        [-87.81683349609375, -54.887062072753906, 24.988933563232422],
        [23.712326049804688, -27.731792449951172, 21.446821212768555],
        [47.69215774536133, 103.88478088378906, 9.540440559387207],
      ].reverse(),
      decal: -58,
      heightDecal: 22,
      lineVisible: false,
      rotation: Math.PI,
      speed: 0.00102,
    })
    this.container.add(this.seagull6.container)
  }

  setButterfly() {
    this.butterfly = new Butterfly({
      time: this.time,
      assets: this.assets,
      curve: [
        [0.22757530212402344, -2.221489429473877, 5],
        [0.22757530212402344, -2.221489429473877, 5],
        [-1.8654354810714722, -4.528411388397217, 5],
        [-4.785167694091797, -7.040308952331543, 5],
        [-7.4153642654418945, -7.535991191864014, 5],
        [-9.737287521362305, -7.310304164886475, 5],
        [-11.392159461975098, -6.660364627838135, 5],
        [-12.330945014953613, -5.16754150390625, 5],
        [-12.177045822143555, -2.9667816162109375, 5],
        [-10.638052940368652, 0.6344614028930664, 5],
        [-7.59529972076416, 4.540771961212158, 5],
        [-3.8008956909179688, 5.488203525543213, 5],
        [-0.7774209976196289, 4.188275337219238, 5],
        [1.0232001543045044, 1.0641200542449951, 5],
        [12.1620547771453857, -0.0138654708862305, 5],
        [5.2728655338287354, -11.17099666595459, 5],
        [-8.22275161743164, -11.026939392089844, 5],
        [-7.304580211639404, -2.692131757736206, 5],
        [-13.927192687988281, -0.6309871673583984, 5],
        [-13.942583084106445, 6.00206995010376, 5.2705764770507812],
        [-5.803896903991699, 9.718185424804688, 5.0827462673187256],
        [1.8961199522018433, 6.00206995010376, 5],
        [2.0, 0.0, -0.18960541486740112],
      ],
    })
    this.container.add(this.butterfly.container)
  }

  setButterfly2() {
    this.butterfly2 = new Butterfly({
      time: this.time,
      assets: this.assets,
      curve: [
        [0.22757530212402344, -2.221489429473877, 5],
        [0.22757530212402344, -2.221489429473877, 5],
        [-1.8654354810714722, -4.528411388397217, 5],
        [-4.785167694091797, -7.040308952331543, 5],
        [-7.4153642654418945, -7.535991191864014, 5],
        [-9.737287521362305, -7.310304164886475, 5],
        [-11.392159461975098, -6.660364627838135, 5],
        [-12.330945014953613, -5.16754150390625, 5],
        [-12.177045822143555, -2.9667816162109375, 5],
        [-10.638052940368652, 0.6344614028930664, 5],
        [-7.59529972076416, 4.540771961212158, 5],
        [-3.8008956909179688, 5.488203525543213, 5],
        [-0.7774209976196289, 4.188275337219238, 5],
        [1.0232001543045044, 1.0641200542449951, 5],
        [12.1620547771453857, -0.0138654708862305, 5],
        [5.2728655338287354, -11.17099666595459, 5],
        [-8.22275161743164, -11.026939392089844, 5],
        [-7.304580211639404, -2.692131757736206, 5],
        [-13.927192687988281, -0.6309871673583984, 5],
        [-13.942583084106445, 6.00206995010376, 5.2705764770507812],
        [-5.803896903991699, 9.718185424804688, 5.0827462673187256],
        [1.8961199522018433, 6.00206995010376, 5],
        [2.0, 0.0, -0.18960541486740112],
      ].reverse(),
    })
    this.container.add(this.butterfly2.container)
  }

  setAudioListener() {
    this.listener = new AudioListener()
    this.camera.camera.add(this.listener)
  }

  setBoxObjectManager() {
    this.boxObjectManager = new BoxObjectManager({
      time: this.time,
      debug: this.debug,
      assets: this.assets,
    })
    this.container.add(this.boxObjectManager.container)
  }

  setParticules() {
    this.particules = new Particles({
      debug: this.debug,
      time: this.time,
      assets: this.assets,
    })
    this.container.add(this.particules.container)
  }

  screenCanvas() {
    this.screenShot.addEventListener('click', () => {
      this.CanvasResult = new CanvasResult({
        playerInventory: this.playerInventory,
        body: this.body,
      })
    })
  }

  getMusicRangeValue() {
    this.musicRange.addEventListener('input', () => {
      this.musicFinVol = this.musicRange.value / 100

      this.music.volume = this.musicFinVol
      this.js_musicVol.innerHTML = this.musicRange.value
    })
  }

  muteSoundMethod() {
    this.muteButton.addEventListener('click', () => {
      this.oldMusicValue = this.musicFinVol
      this.oldAmbianceValue = this.floor.ambianceFinVol
      this.music.volume = 0
      this.floor.oceanSound.setVolume(0)
      this.floor.riverSound.setVolume(0)
      this.musicRange.disabled = true
      this.ambianceRange.disabled = true
      this.muteButton.style.display = 'none'
      this.unmuteButton.style.display = 'block'
    })
  }

  unmuteSoundMethod() {
    this.unmuteButton.addEventListener('click', () => {
      this.music.volume = this.oldMusicValue
      this.floor.oceanSound.setVolume(this.oldAmbianceValue)
      this.floor.riverSound.setVolume(this.oldAmbianceValue)
      this.musicRange.disabled = false
      this.ambianceRange.disabled = false
      this.muteButton.style.display = 'block'
      this.unmuteButton.style.display = 'none'
    })
  }

  openDiagOne() {
    document.addEventListener('keydown', this.handleKeyE.bind(this), false)
    // document.addEventListener(
    //   'keydown',
    //   this.handleKeyF.bind(this),
    //   false
    // )
  }

  keyPressAction() {
    document.addEventListener('keyup', this.handleKeyE.bind(this), false)
    // document.addEventListener(
    //   'keydown',
    //   this.handleKeyF.bind(this),
    //   false
    // )
  }

  handleKeyE(event) {
    // if(!this.playerEnteredInElmo ) {
    //   return
    // }
    switch (event.code) {
      case 'KeyE': // e
        if (this.elementEntered !== null && this.elementEntered !== undefined) {
          this.collecteObject()
        }

        if (this.playerEnteredInElmo === true) {
          this.getElmo()
        }
        break
    }
  }

  getElmo() {
    this.elmo.getPeted = true
  }

  collecteObject() {
    if (this.elementEntered.isCollected === false) {
      if (this.playerInventory.length < 8) {
        this.elementEntered.isCollected = true
        this.playerInventory.push(Data.monde_1[this.elementEntered.child.name])

        this.setItemCard()
        this.outline.selectedObjects = []
        this.perso.victoryAnimation()
        this.elmo.victoryAnimation()
        this.appThis.checkInventoryLength()
        this.showPictureObject(Data.monde_1[this.elementEntered.child.name])
        this.musicObject.volume = 0.25
        this.musicObject.play()
      }
    }
  }

  showPictureObject(image) {
    
    this.imageShow = document.createElement('img')
    this.imageShow.src = image.links.image
    this.imageShow.classList.add('js_showPictureObject', 'showedPicture')
    
    this.divShowedPic = document.createElement('div')
    this.divShowedPic.classList.add('showedpicDiv')
    
    this.divShowedPic.appendChild(this.imageShow)
    this.body.appendChild(this.divShowedPic)

    this.showPictureTL
      .to(this.imageShow, { duration: 1, scale: 0.45, rotate: '10deg', ease: 'Power4.inOut'})
      .to(this.divShowedPic, {duration: 1, scale: 0.3,x: '-400%', y: '110%', ease: 'Power4.inOut'}, '+=1.5')
  }

  setItemCard() {
    let emptySpaces = document.querySelector(
      '.inventory_content_items_item.empty'
    )
    emptySpaces.classList.remove('empty')
    let cardImg = emptySpaces.querySelector(
      `img[src*="${Data.monde_1.empty.links.image}"]`
    )
    cardImg.src = Data.monde_1[this.elementEntered.child.name].links.image

    let buttonDelete = document.createElement('button')
    buttonDelete.classList.add('item_button')
    buttonDelete.innerText = 'Supprimer ?'
    buttonDelete.dataset.dataJs = 'js_deleteObject'
    buttonDelete.dataset.object =
      Data.monde_1[this.elementEntered.child.name].data_object
    buttonDelete.addEventListener('click', this.deleteItemCard.bind(this))

    emptySpaces.appendChild(buttonDelete)
  }

  createInventory() {
    let item = document.createElement('div')
    item.classList.add('inventory_content_items_item', 'empty', 'js_itemsInv')

    let item_image = document.createElement('img')
    item_image.setAttribute('src', Data.monde_1.empty.links.image)

    item.appendChild(item_image)
    this.itemsIventory.appendChild(item)
  }

  deleteItemCard(event) {
    event.target.parentNode.querySelector('img').src =
      Data.monde_1.empty.links.image
    event.target.parentNode.classList.add('empty')
    event.target.parentNode.removeChild(event.target)
    this.playerInventory = this.playerInventory.filter((element) => {
      return element.data_object !== event.target.dataset.object
    })
    this.boxObjectManager.boxesArr[
      event.target.dataset.object
    ].isCollected = false
  }

  openInventoryMethod() {
    this.openInventory.addEventListener('click', () => {
      this.itemProps = document.querySelectorAll('.inventory_content_items_item')
      this.body.classList.add('open_inventory')
    
      this.inventoryTL
        .to(this.openInventory, {duration: 1, opacity: 0, display: 'none', ease: 'Power4.out'})
        .to(this.bubbleInventory, {duration: 1.2, transform: `scale(380)`, ease: 'Power4.inOut'}, '-=1')
        .to(this.closeInventory, {duration: 1, opacity: 1, display: 'block', ease: 'Power4.out'}, '-=1')
        .fromTo(this.itemProps,{x:'50%', opacity: 0}, {duration: 1, x: '0%', opacity: 1, ease: 'Power4.out',stagger: 0.1}, '-=0.6')
    })
  }

  closeInventoryMethod() {
    this.closeInventory.addEventListener('click', () => {
      this.inventoryTL
        .to(this.itemProps, {duration: 1, x: '50%', opacity: 0, ease: 'Power4.out',stagger: 0.1})
        .to(this.closeInventory, {duration: 1, opacity: 0, display: 'none', ease: 'Power3.out'}, '-=1')
        .to(this.bubbleInventory, {duration: 1.2, transform: 'scale(1)', ease: 'Power4.inOut'}, '-=1' )
        .to(this.openInventory, {duration: 1, opacity: 1, display: 'block', ease: 'Power3.out'}, '-=1')
      setTimeout(()=> {

        this.body.classList.remove('open_inventory')
      },2000)
    })
  }



  closeDiag() {
    document.removeEventListener('keydown', this.handleKeyE, false)
    document.removeEventListener('keydown', this.handleKeyF, false)
  }

  PlayerEnterObjectArea() {
    this.time.on('tick', () => {
      if (
        this.perso.moveForward ||
        this.perso.moveBackward ||
        this.perso.moveLeft ||
        this.perso.moveRight
      ) {
        for (const elementName in this.boxObjectManager.boxesArr) {
          const element = this.boxObjectManager.boxesArr[elementName]
          this.playerenteredInObject = element.objectBB.intersectsBox(
            this.perso.playerBB
          )

          if (this.playerenteredInObject === true) {
            this.elementEntered = element
            this.meshes = []
            this.elementEntered.child.traverse((child) => {
              if (child.isMesh) {
                this.meshes.push(child)
              }
            })
            if (element.isCollected === false) {
              this.outline.selectedObjects = this.meshes
            }
            this.keyPressAction()
          }
          // else{
          // this.appThis.outlinePass.selectedObjects.pop()
          // }

          if (
            this.playerenteredInObject !== true &&
            this.elementEntered === element
          ) {
            this.elementEntered = null
            this.outline.selectedObjects = []
          }
        }
      }
    })
  }

  PlayerEnterElmoArea() {
    this.time.on('tick', () => {
      if (
        this.perso.moveForward ||
        this.perso.moveBackward ||
        this.perso.moveLeft ||
        this.perso.moveRight
      ) {
        this.playerEnteredInElmo = this.elmo.elmoBB.intersectsBox(
          this.perso.playerBB
        )
        if (this.playerEnteredInElmo === true) {
          this.openDiagOne()
        }
      }
    })
  }

  createUi() {
    const inv = document.querySelector('.inventory_content_items')
    for (let i = 1; i <= 8; i++) {
      this.createInventory()
    }
    // this.items = [... document.querySelectorAll('inventory_content_items_item')]
    // window.addEventListener("MozMousePixelScroll", handleScroll(event, this))
    window.addEventListener('wheel', handleScroll)
    // window.addEventListener("mousewheel", handleScroll(event, this))
    // window.addEventListener("DOMMouseScroll", handleScroll(event, this))
    let that = this
    function handleScroll(e) {
      that.docWidth = inv.offsetWidth

      if (that.scrollValue - e.deltaY > 0) {
        that.scrollValue = 0
      } else if (
        that.scrollValue - e.deltaY <
        -that.docWidth + that.sizes.viewport.width
      ) {
        that.scrollValue = -that.docWidth + that.sizes.viewport.width
      } else {
        that.scrollValue -= e.deltaY
      }
      // that.scrollValuePercentage = (that.scrollValue/(that.docWidth - that.sizes.viewport.width)) * 100

      inv.style.transform = `translateX(${that.scrollValue}px)`
    }
    this.optionButton = document.querySelector('.js_optionsBtn')
    this.closeOptionButton = document.querySelector('.js_closeOptions')
    setTimeout(()=> {
      this.tutoTL
        .to(this.showInventory, {duration: 1, opacity: 1, ease: 'Power4.out'})
        .to(this.showOptions, {duration: 1, opacity: 1, ease: 'Power4.out'}, '-=1')
    }, 1500)

    setTimeout(()=> {
      this.playTuto()
    }, 3500)
  }

  openOptionsMethod() {

    this.mute = document.querySelector('.sound_mute')
    this.optionsTitle = document.querySelector('.options_titleText')
    this.optionSounds = document.querySelector('.options_sounds')
    this.optionReplayCta = document.querySelector('.options_container_replay')
    this.blobOption = document.querySelector('.blobOption')

    this.optionButton.addEventListener('click', () => {
      this.body.classList.add('open_options')
      if (this.body.classList.contains('open_inventory')) {
        this.inventoryTL
          .to(this.itemProps, {duration: 1, x: '50%', opacity: 0, ease: 'Power4.out',stagger: 0.1})
          .to(this.closeInventory, {duration: 1, opacity: 0, display: 'none', ease: 'Power3.out'}, '-=1')
          .to(this.bubbleInventory, {duration: 1.2, transform: 'scale(1)', ease: 'Power4.inOut'}, '-=1' )
          .to(this.openInventory, {duration: 1, opacity: 1, display: 'block', ease: 'Power3.out'}, '-=1')
          
        setTimeout(()=> {

          this.body.classList.remove('open_inventory')
        },2000)
      }

      this.optionTL
        .to(this.optionButton, {duration: 1, opacity: 0, display: 'none', ease: 'Power4.out'})
        .to(this.bubbleOption, {duration: 1.2, transform: `scale(380)`, ease: 'Power4.inOut'}, '-=1')
        .to(this.closeOptionButton, {duration: 1, opacity: 1, display: 'block', ease: 'Power4.out'}, '-=1')
        .to(this.mute, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
        .to(this.blobOption, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
        .to(this.optionsTitle, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionSounds, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionReplayCta, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')

    })
  }

  closeOptionsMethod() {
    this.replayCta = document.querySelector('.js_replayCta')

    this.closeOptionButton.addEventListener('click', () => {
      this.optionTL
        .to(this.closeOptionButton, {duration: 1, opacity: 0, display: 'none', ease: 'Power3.out'})
        .to(this.mute, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.blobOption, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionsTitle, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionSounds, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionReplayCta, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.bubbleOption, {duration: 1.2, transform: 'scale(0)', ease: 'Power4.inOut'})
        .to(this.optionButton, {duration: 1, opacity: 1, display: 'block', ease: 'Power3.out'}, '-=1')

      setTimeout(()=> {
        this.body.classList.remove('open_options')
      },2000)
    })

    this.replayCta.addEventListener('click', () => {
      this.optionTL
        .to(this.closeOptionButton, {duration: 1, opacity: 0, display: 'none', ease: 'Power3.out'})
        .to(this.mute, {duration: 1, opacity: 0, ease: 'Power4.inOut'})
        .to(this.blobOption, {duration: 1, opacity: 0, ease: 'Power4.inOut'},'-=1')
        .to(this.optionsTitle, {duration: 1, opacity: 0, ease: 'Power4.inOut'},'-=1')
        .to(this.optionSounds, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.optionReplayCta, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
        .to(this.bubbleOption, {duration: 1.2, transform: 'scale(0)', ease: 'Power4.inOut'}, '-=1' )
        .to(this.optionButton, {duration: 1, opacity: 1, display: 'block', ease: 'Power3.out'}, '-=1')

      setTimeout(()=> {
        this.body.classList.remove('open_options')
      },2000)
    })
  }

  playTuto() {
    this.tutorial = document.querySelectorAll('.tutorial')
    this.keyboardTuto = document.querySelector('.keyboardTuto')
    this.mouseTuto = document.querySelector('.mouseTuto')
    this.shiftKey = document.querySelector('.shiftKey')
    this.eKey = document.querySelector('.eKey')
    this.spaceKey = document.querySelector('.spaceKey')

    this.subtitle = document.querySelector('.subtitle')
    this.subtitleTitle = document.querySelector('.subtitle_Title')
    this.speechKeyboard = document.querySelector('.speechKeyboard')
    this.speechMouse = document.querySelector('.speechMouse')
    this.speechShift = document.querySelector('.speechShift')
    this.speechKeyE = document.querySelector('.speechKeyE')
    this.speechSpace = document.querySelector('.speechSpace')

    this.tutoTL
      .to(this.tutorial, {duration: 1, opacity: 1, display: 'block', ease: 'Power4.inOut'})
      .to(this.keyboardTuto, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
      .to(this.keyboardTuto, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.mouseTuto, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.mouseTuto, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.shiftKey, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.shiftKey, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.eKey, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.eKey, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.spaceKey, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.spaceKey, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.tutorial, {duration: 1, opacity: 0, display: 'none', ease: 'Power4.inOut'}, '-=1')

    this.speechTl
      .to(this.subtitle, {duration: 1, opacity: 1, display:'block', ease: 'Power4.inOut'})
      .to(this.subtitleTitle, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
      .to(this.speechKeyboard, {duration: 1, opacity: 1, ease: 'Power4.inOut'}, '-=1')
      .to(this.speechKeyboard, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.speechMouse, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.speechMouse, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.speechShift, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.speechShift, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.speechKeyE, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.speechKeyE, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.speechSpace, {duration: 1, opacity: 1, ease: 'Power4.inOut'})
      .to(this.speechSpace, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '+=4')
      .to(this.subtitleTitle, {duration: 1, opacity: 0, ease: 'Power4.inOut'}, '-=1')
      .to(this.subtitle, {duration: 1, opacity: 0, display: 'none', ease: 'Power4.inOut'}, '-=1')
      
  }
}
