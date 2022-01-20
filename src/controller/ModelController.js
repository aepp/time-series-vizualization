import {
  Scene,
  Color,
  WebGLRenderer,
  PerspectiveCamera,
  LineBasicMaterial,
  Vector3,
  BufferGeometry,
  Line,
  Points,
  Float32BufferAttribute,
  PointsMaterial,
} from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

const colors = [0x33ff33, 0x0000ff, 0xff00ff, 0x00ffff, 0x222222];
const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};
export class ModelController {
  // basic
  _rootElement;

  _width;

  _height;

  // three.js
  _scene;

  _renderer;

  _camera;

  _controls;

  // data
  _framesPerPerson;

  _colorsPerPerson;

  _maxFramesCount;

  _currentFrameIdx;

  constructor(
    { width, height, rootElement } = {
      width: window.innerWidth,
      height: window.innerHeight,
      rootElement: document.body,
    }
  ) {
    this._width = width;
    this._height = height;
    this._rootElement = rootElement;
  }

  init() {
    this._scene = new Scene();
    this._scene.background = new Color(0xeeeeee);

    this._renderer = new WebGLRenderer();
    this._renderer.setSize(this._width, this._height);
    this._rootElement.appendChild(this._renderer.domElement);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._camera = new PerspectiveCamera(
      75,
      this._width / this._height,
      1,
      500
    );
    this._camera.position.set(20, 0, 100);
    this._camera.lookAt(50, 0, 0);

    this._controls = new TrackballControls(
      this._camera,
      this._renderer.domElement
    );
    this._controls.rotateSpeed = 10;
    this._controls.minDistance = 100;
    this._controls.maxDistance = 500;

    // const listener = () => {
    //   this._camera.position.set(30, 0, 100);
    // };
    // this._renderer.domElement.addEventListener('mousedown', listener.bind(this));
    return this;
  }

  initFrames({ framesPerPerson, framesCount }) {
    this._framesPerPerson = framesPerPerson;
    this._currentFrameIdx = 1700;
    this._maxFramesCount = framesCount;
    this._colorsPerPerson = framesPerPerson.map(() => getRandomColor());

    return this;
  }

  asPoints() {
    for (const person of this._framesPerPerson[this._currentFrameIdx]) {
      const vertices = person["points"].flat;

      const geometry = new BufferGeometry();

      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(vertices, 3)
      );

      const material = new PointsMaterial({ size: 1, color: 0xff3333 });

      // const mesh = new Mesh( geometry, material );

      const points = new Points(geometry, material);

      this._scene.add(points);
    }
    return this;
  }
  asLines() {
    const frame = this._framesPerPerson[this._currentFrameIdx];
    for (const person of frame) {
      const bodyLines = person["points"].bodyLines;

      const material = new LineBasicMaterial({
        color: this._colorsPerPerson[person.personIdx],
      });

      for (const bodyLine of bodyLines) {
        const geometry = new BufferGeometry();
        const points = [];
        for (const point of bodyLine) {
          points.push(new Vector3(point.x, point.y, point.z));
        }
        geometry.setFromPoints(points);
        const line = new Line(geometry, material);
        this._scene.add(line);
      }
    }
    return this;
  }

  async animateFrames() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    requestAnimationFrame(this.animateFrames.bind(this));
    this._controls.update();
    this.renderFrame.call(this);
    return this;
  }

  renderFrame() {
    if (this._currentFrameIdx === this._maxFramesCount - 1) {
      this._currentFrameIdx = -1;
    }
    this._currentFrameIdx += +1;
    this._scene.clear();
    this.asLines();
    this.asPoints();
    this._renderer.render(this._scene, this._camera);
    return this;
  }

  // staticRender(frameIdx = 0) {
  //   this._currentFrameIdx = frameIdx;
  //   this._scene.clear();
  //   this.asLines();
  //   this._renderer.render(this._scene, this._camera);
  //   return this;
  // }
}
