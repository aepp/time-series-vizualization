import { _3d as _3dLib } from "d3-3d";
import { select } from "d3-selection";
import { drag } from "d3-drag";
import { color } from "d3-color";

const dataPoints = [
  [ 1, 1, -1],
  [ -1, 1, -1],
  [ -1, -1, -1],
  [ 1, -1, -1],
  [ 1, 1, -1],
  [ 1, -1, -1],
  [ -1, 1, -1],
  [ -1, -1, -1],
  [ 1, 1, 1],
  [ -1, 1, 1],
  [ -1, -1, 1],
  [ 1, -1, 1],
  [ 1, 1, 1],
  [ 1, -1, 1],
  [ -1, 1, 1],
  [ -1, -1, 1],
  [ -1, 1, 1],
  [ -1, 1, -1],
  [ 1, 1, 1],
  [ 1, 1, -1],
  [ -1, -1, 1],
  [ -1, -1, -1],
  [ 1, -1, 1],
  [ 1, -1, -1],
];

let dataLines = [
  [
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
  ],
  [
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
  ],
  [
    { x: 1, y: 1, z: -1 },
    { x: 1, y: -1, z: -1 },
  ],
  [
    { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: -1 },
  ],
  [
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
  ],
  [
    { x: -1, y: -1, z: 1 },
    { x: 1, y: -1, z: 1 },
  ],
  [
    { x: 1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 },
  ],
  [
    { x: -1, y: 1, z: 1 },
    { x: -1, y: -1, z: 1 },
  ],
  [
    { x: -1, y: 1, z: 1 },
    { x: -1, y: 1, z: -1 },
  ],
  [
    { x: 1, y: 1, z: 1 },
    { x: 1, y: 1, z: -1 },
  ],
  [
    { x: -1, y: -1, z: 1 },
    { x: -1, y: -1, z: -1 },
  ],
  [
    { x: 1, y: -1, z: 1 },
    { x: 1, y: -1, z: -1 },
  ],
];

export const DrawCubeD33D = {
  run: () => {
    let origin = [480, 250],
      startAngle = Math.PI / 8,
      beta = startAngle;
    let svg = select("svg")
      .call(
        drag().on("drag", dragged).on("start", dragStart).on("end", dragEnd)
      )
      .append("g");

    let mx, mouseX;

    let _3d = _3dLib()
      .scale(50)
      .origin(origin)
      .rotateX(startAngle)
      .rotateY(startAngle)
      .shape("POINT");

    function dragStart(event) {
      mx = event.x;
    }

    function dragged(event) {
      mouseX = mouseX || 0;
      beta = (((event.x - mx + mouseX) * Math.PI) / 360) * -1;
      init(_3d.rotateY(beta + startAngle)(data));
    }

    function dragEnd(event) {
      mouseX = event.x - mx + mouseX;
    }

    function init(data) {
      let lines = svg.selectAll("line").data(data);

      lines
        .enter()
        .append("line")
        .merge(lines)
        .attr("fill", color("black"))
        .attr("stroke", color("black"))
        .attr("stroke-width", 1)
        .attr("x1", function (d) {
          return d.x;
        })
        .attr("y1", function (d) {
          return d.y;
        })
        .attr("x2", function (d) {
          return d.x;
        })
        .attr("y2", function (d) {
          return d.y;
        });

      lines.exit().remove();
    }
    init(_3d(dataLines));
  },
};
